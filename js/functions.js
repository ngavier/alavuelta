var map;
var markers = [];
var pos;

var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

MELI.init("MLA");
function clearMarkers()
{
    for (var i = 0; i < markers.length; i++) 
    {
        markers[i].setMap(null);
    }
}
function showMarkers()
{
    for (var i = 0; i < markers.length; i++) 
    {
        markers[i].setMap(map);
    }
}
function eraseMarkers()
{
    clearMarkers();
    while (markers.length > 0)
    {
        markers.pop();
    }
}
function mostrarMapa(catID)
{
    $(document).scrollTop(0);
    $('#categories').css('display','none');
    console.log('mostrarMapa('+catID+');');
    $('#contenedor').css('display','block');
    $('#btn-menu').removeClass('ch-btn-disabled');
    $('#btn-menu').text('Categorías');
    $('#btn-menu').attr('onclick','mostrarCategorias();');
    getItems(catID);
}

function getCategorias()
{
    console.log('getCategorias');
    MELI.get('/categories/MLA1459',null,function(data){
        $(data[2].children_categories).each(function(i,item){
            var li = $('<li id="'+item.id+'" class="categoria"></li>');
            li.append('<p>'+item.name+'</p>');
            li.appendTo('#listaCategorias');
            getSubCategorias(item.id,li);
        });
        
    });
}
function getSubCategorias(id, li)
{
    MELI.get('/categories/'+id,null,function(data){
        var ulSub = $('<ul class="ch-list" id="listaSubcategorias"></ul>').appendTo(li);
        $(data[2].children_categories).each(function(i,item){
            var liSub = $('<li id="'+item.id+'" class="subcategoria"></li>');
            liSub.append('<a onclick=mostrarMapa(\''+item.id+'\');>'+item.name+'<a>');
            liSub.appendTo(ulSub);
        });
    });
}
function mostrarCategorias()
{
    $('#categories').css('display','block');
    //$('#categories').toggleClass('nodisplay');
    $('#contenedor').css('display','none');
    //$('#contenedor').toggleClass('nodisplay');
    //$('#btn-menu').addClass('ch-btn-disabled');
    $('#btn-menu').text('Mapa');
    $('#btn-menu').attr('onclick','closeCategories();');
    //clearMarkers();
}
function closeCategories()
{
    $('#categories').css('display','none');
    //$('#categories').toggleClass('nodisplay');
    $('#contenedor').css('display','block');
    //$('#contenedor').toggleClass('nodisplay');
    $('#btn-menu').text('Categorías');
    $('#btn-menu').attr('onclick','mostrarCategorias();');
}
function verRuta(lat,lng)
{
    console.log('ver ruta '+ lat + ' '+lng);
    var start = pos;
    var end = new google.maps.LatLng(lat,lng);
    var request = {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
    //$('#ver-ruta').toggleClass('nodisplay');
    $('#directions').width('100%');
    $('#contenedor').css('width','100%');
    $('#contenedor').css('float','left');
    $('#directions').toggleClass('nodisplay');
    closeInfoPanel();
    //$('#vip').css('display','none');
    clearMarkers();
    map.setCenter(pos);
    $(document).scrollTop(0);
}
function eliminarRuta()
{
    directionsDisplay.setMap(null);
    $('#directions').toggleClass('nodisplay');
    $('#contenedor').width('100%');
    showMarkers();
}

function mostrarInfo(item)
{
    $(document).scrollTop(0);
    map.setCenter(pos);
    MELI.get('/users/'+item.seller.id, null, function(data){
        $('#seller-link').append(data[2].nickname);
        $('#seller-link').attr('href',data[2].permalink);
    });
    MELI.get('/items/'+item.id,null,function(data){
        prod = data[2];
        $('#meliThumb').append('<img id="thumb" src="' + prod.pictures[0].url + '" />');
        $('#operation').append(prod.attributes[1].name + ': ' + prod.attributes[1].value_name);
        $('#ambientes').append(prod.attributes[2].name + ': ' + prod.attributes[2].value_name);
        $('#superficie').append(prod.attributes[3].name + ': ' + prod.attributes[3].value_name);
        $('#attribute').append(prod.attributes[4].name + ': ' + prod.attributes[4].value_name);
        $('#attribute2').append(prod.attributes[5].name + ': ' + prod.attributes[5].value_name);
    });
    $('#item #titulo').append(item.title);
    //$('#meliThumb').append('<img id="thumb" src="' + item.thumbnail + '" />'); //Datos del item seleccionado.
    $('#vip').css('display','block');
    
    var price = item.price;
    var priceFormatted = price.toFixed(2).replace(/./g, function(c, i, a) {return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;});
    $('#item p').append(item.currency_id+' '+priceFormatted);
    
    $('#contenedor').toggleClass('transparente');
    $('#contenedor').css('display','none');
    
    $('#btn-menu').removeClass('ch-btn-disabled');
    $('#btn-menu').empty();
    $('#btn-menu').attr('onclick','closeInfoPanel();');
    $('#btn-menu').addClass('ch-btn-back');
    $('#btn-menu').text('Volver');
    $('#ver-meli').attr('href',item.permalink);
    $('#location').append(item.location.address_line);
    
    $('#mostrar-ruta').attr('onclick','verRuta('+item.location.latitude+','+item.location.longitude+');');
}

function closeInfoPanel()
{
    $('#vip').css('display','none');
    //$('#contenedor').css('width','100%');
    $('#contenedor').css('display','block');
    $('.aside #titulo').empty();
    $('#item p').empty();
    $('#meliThumb').empty();
    $('.description').empty();
    $('#contenedor').toggleClass('transparente');
    
    $('#btn-menu').empty();
    $('#btn-menu').append('Categorias');
    $('#btn-menu').attr('onclick','mostrarCategorias();');
    $('#btn-menu').addClass('ch-btn-back');
    
    $('#seller-link').empty();
    $('#seller-link').attr('href','');
    $('#location').empty();
    $('#operation').empty();
    $('#ambientes').empty();
    $('#superficie').empty();
    $('#attribute').empty();
    $('#attribute2').empty();
}

function initialize() 
{   
    getCategorias();
    directionsDisplay = new google.maps.DirectionsRenderer({preserveViewport: true});
    var mapOptions = {
        zoom: 13
    };
    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions);
        // Try HTML5 geolocation
    if(navigator.geolocation)
    {
      navigator.geolocation.getCurrentPosition(function(position) {
        pos = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
        map.setCenter(pos);
        var marker = new google.maps.Marker({
                                      position: pos,
                                      map: map,
                                      title: 'Posicion',
                                      icon: 'https://www.google.com/mapfiles/marker_black.png'
                                  });
        drawSearchRange();

      }, function() {
        handleNoGeolocation(true);
      });
    } else {
      // Browser doesn't support Geolocation
      handleNoGeolocation(false);
    }
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    google.maps.event.addListener(map, "idle", function() {map.setCenter(pos);});
}

function drawSearchRange()
{
    var polygonCoords = [
            new google.maps.LatLng(pos.lat()-0.06, pos.lng()-0.06),
            new google.maps.LatLng(pos.lat()+0.06, pos.lng()-0.06),
            new google.maps.LatLng(pos.lat()+0.06, pos.lng()+0.06),
            new google.maps.LatLng(pos.lat()-0.06, pos.lng()+0.06)
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
}

function handleNoGeolocation(errorFlag) {
  if (errorFlag) {var content = 'Error: No se pudo obtener la ubicación';} 
  else {var content = 'Error: Este dispositivo no soporta geolocalización';}
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
    
    eraseMarkers();
    
    var seguir = false;
    do
    {
        MELI.get('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200&item_location=lat:'+(locationLat-0.06)+'_'+(locationLat+0.06)+'%2clon:'+(locationLong-0.06)+'_'+(locationLong+0.06), null, function(data){
        //MELI.get('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200', null, function(data){
        //console.log('Total: ' + data[2].paging.total);   
        $(data[2].results).each(function(i, item){
            var marker = new google.maps.Marker({
                     position: new google.maps.LatLng(item.location.latitude,item.location.longitude),
                     map: map,
                     title: item.title + '-- Telefono:' + item.seller_contact.area_code + '-' +  item.seller_contact.phone
                 });
                 markers.push(marker);
                 google.maps.event.addListener(marker, 'click', function(){
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
               else 
               {
                    seguir = false; console.log('no seguir');
               }
        });
    }
    while(seguir);
    //console.log('/sites/MLA/search?category='+category+'&offset='+offset+'&limit=200&item_location=lat:'+(locationLat-0.05)+'_'+(locationLat+0.05)+'%2clon:'+(locationLong-0.05)+'_'+(locationLong+0.05));
}