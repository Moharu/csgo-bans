var defaultBorder = '1.5px solid rgb(221, 221, 221)';
var bannedBorder = '2.5px solid rgb(255, 0, 0)';

var toggleFade = function(map){
    var mapObj = $('#'+map);
    mapObj.css('opacity',mapObj.css('opacity') === '1'? '0.2' : '1');
}

var setFade = function(map, state){
    var mapObj = $('#'+map);
    mapObj.css('opacity', state? '0.2' : '1');
}

var isFaded = function(map){
    return $('#'+map).css('opacity') === '0.2';
}

var setMyBan = function(map){
    if(map==='')
        return '';
    $('#'+map).parent().css('border', bannedBorder);
    //$('#'+map).parent().css('background', 'red');
}

var resetMyBan = function(map){
    $('#'+map).parent().css('border', defaultBorder);
    //$('#'+map).parent().css('background', '');
}

var resetAllFades = function(){
    maps = ["dust2", "inferno", "mirage", "cache", "train", "cobblestone", "overpass"]
    maps.map(function(map){
        setFade(map, false);
    });
}

websocket.onclose = function(){
    location.reload();
};

websocket.onmessage = function(message){
    var msg = JSON.parse(message.data);
    if(msg.type == 'refreshMaps'){
        resetAllFades();
        var bannedMaps = msg.bannedMaps;
        bannedMaps.reduce(function(last, current){
            setFade(current, true);
            return 0;
        }, 0);
    }
    if(msg.type == 'getCurrent'){
        websocket.send(JSON.stringify({type: 'banMap', map: yourBan}));
    }
}

websocket.onopen = function(){
    $(document).ready(function(){
        websocket.send(JSON.stringify({type:'ready'}));
    });
}

var yourBan = '';

$(document).ready(function(){
    $("img").click(function(){
        if(this.id === yourBan){
            yourBan = '';
            resetMyBan(this.id);
            websocket.send(JSON.stringify({type: 'banMap', map: this.id}));
        } else if(isFaded(this.id)){
            // do nothing
            return null;
        } else if(yourBan === ''){
            yourBan = this.id;
            setMyBan(yourBan);
            websocket.send(JSON.stringify({type: 'banMap', map: this.id}));
        } else {
            websocket.send(JSON.stringify({type: 'banMap', map: yourBan}));
            resetMyBan(yourBan);
            websocket.send(JSON.stringify({type: 'banMap', map: this.id}));
            yourBan = this.id;
            setMyBan(yourBan);
        }
    });
});