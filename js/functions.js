var map;
var markers = [];
var pos;
MELI.init("MLA");
function clearMarkers()
{
    for (var i = 0; i < markers.length; i++) 
    {
        markers[i].setMap(null);
    }
}
function mostrarMapa(catID)
{
    $('#categories').css('display','none');
    console.log('mostrarMapa('+catID+');');
    getItems(catID);
    $('#contenedor').css('display','block');
    $('#btn-menu').removeClass('ch-btn-disabled');
}
function mostrarCategorias()
{
    $('#categories').css('display','block');
    $('#contenedor').css('display','none');
    $('#btn-menu').addClass('ch-btn-disabled');
    clearMarkers();
}
function mostrarInfo(item)
{
    map.setCenter(pos);
    MELI.get('/users/'+item.seller.id, null, function(data){
        $('#seller-link').append(data[2].nickname);
        $('#seller-link').attr('href',data[2].permalink);
    });
    console.log(item.id);
    $('#item #titulo').append(item.title);
    $('#meliThumb').append('<img id="thumb" src="' + item.thumbnail + '" />'); //Datos del item seleccionado.
    $('#vip').css('display','block');
    
    var price = item.price;
    var priceFormatted = price.toFixed(2).replace(/./g, function(c, i, a) {return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;});
    $('#item p').append(item.currency_id+' '+priceFormatted);
    
    $('#contenedor').toggleClass('transparente');
    $('#contenedor').css('display','none');
    
    $('#btn-menu').removeClass('ch-btn-disabled');
    $('#btn-menu').empty();
    $('#btn-menu').attr('onclick','closeInfoPanel();')
    $('#btn-menu').addClass('ch-btn-back');
    $('#btn-menu').append('Volver');
    $('#ver-meli').attr('href',item.permalink);
    $('#location').append(item.location.address_line);
    $('#operation').append(item.attributes[1].value_name);
    $('#ambientes').append(item.attributes[2].value_name);
    $('#ambientes').append(' Ambientes');
    $('#superficie').append(item.attributes[3].value_name);
    $('#superficie').append(' m2');
}

function closeInfoPanel()
{
    $('#vip').css('display','none');
    $('#contenedor').css('width','100%');
    $('#contenedor').css('display','block');
    $('.aside #titulo').empty();
    $('#item p').empty();
    $('#meliThumb').empty();
    $('.description').empty();
    $('#contenedor').toggleClass('transparente');
    //$('#btn-menu').removeClass('ch-btn-back');
    //$('#btn-menu').addClass('ch-btn-disabled');
    
    $('#btn-menu').empty();
    $('#btn-menu').append('Categorias');
    $('#btn-menu').attr('onclick','mostrarCategorias();');
    $('#btn-menu').addClass('ch-btn-back');
    
    //$('#btn-menu').empty();
    $('#seller-link').empty();
    $('#seller-link').attr('href','');
    $('#location').empty();
    $('#operation').empty();
    $('#ambientes').empty();
    $('#superficie').empty();
}

function initialize() {
    
  var mapOptions = {
    zoom: 13
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);
      // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
      
      
      map.setCenter(pos);
      
      var marker = new google.maps.Marker({
                                    position: pos,
                                    map: map,
                                    title: 'Posicion',
                                    icon: 'https://www.google.com/mapfiles/marker_black.png'
                                });
      
      //getItems(1,'MLA1468');
      //getItems(1,'MLA1459');
      
      var polygonCoords = [
            new google.maps.LatLng(pos.lat()-0.02, pos.lng()-0.02),
            new google.maps.LatLng(pos.lat()+0.02, pos.lng()-0.02),
            new google.maps.LatLng(pos.lat()+0.02, pos.lng()+0.02),
            new google.maps.LatLng(pos.lat()-0.02, pos.lng()+0.02)
  ];
  searchRange = new google.maps.Polygon({
    paths: polygonCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FFFF00',
    fillOpacity: 0.2
  });
  searchRange.setMap(map);
      
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
  
  google.maps.event.addListener(map, "idle", function() {map.setCenter(pos); /*console.log(pos.toString());*/});
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: No se pudo obtener la ubicación';
  } else {
    var content = 'Error: Este dispositivo no soporta geolocalización';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}

function getItems(category)
{
    var offset=0;
    var locationLat = pos.lat();
    var locationLong = pos.lng();
    
    var seguir = false;
    do
    {
        MELI.get('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200&item_location=lat:'+(locationLat-0.02)+'_'+(locationLat+0.02)+'%2clon:'+(locationLong-0.02)+'_'+(locationLong+0.02), null, function(data){
        //MELI.get('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200', null, function(data){
        console.log('Total: ' + data[2].paging.total);   
        $(data[2].results).each(function(i, item){
                           var marker = new google.maps.Marker({
                                    position: new google.maps.LatLng(item.location.latitude,item.location.longitude),
                                    map: map,
                                    title: item.title + '-- Telefono:' + item.seller_contact.area_code + '-' +  item.seller_contact.phone
                                });
                                markers.push(marker);
                                google.maps.event.addListener(marker, 'click', function(){
                                    //map.setZoom(8);
                                    /*var info = new google.maps.InfoWindow({
                                        map: map,
                                        position: marker.getPosition(),
                                        content: item.title + '<br /> Telefono:' + item.seller_contact.area_code + '-' +  item.seller_contact.phone
                                    }); */
                                    marker.setIcon('https://www.google.com/mapfiles/marker_green.png');
                                    mostrarInfo(item);
                                });
                                
                   });
                   if (offset+200 < data[2].paging.total)
                   {
                       seguir = true;
                       offset += 200;
                       console.log('seguir');
                   }
                   else {seguir = false; console.log('no seguir');}
        });
        
    }
    while(seguir);
    //console.log('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200&item_location=lat:'+(locationLat-0.05)+'_'+(locationLat+0.05)+'%2clon:'+(locationLong-0.05)+'_'+(locationLong+0.05));
}