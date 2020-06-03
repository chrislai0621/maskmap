
//#region 宣告變數與element
var _data = []; //api下載的資料
var _date = new Date();
var elMenuIcon = document.querySelector('.main-menu-icon');
var elSideBar = document.querySelector('.map-content-aside');
var elMapContent = document.querySelector('.map-content-main');
var btnSearch = document.querySelector('.btn-search');
var elMapList = document.getElementById('map-list');
//設定一個地圖，將地圖定位在#mapId這個div上
//先定位在center的經緯度，zoom在15
var elmap = L.map('mapId', {
    center: [25.0677307, 121.4750888],
    zoom: 15
});
var markers = new L.MarkerClusterGroup();// 新增一個圖層，這圖層專門放 icon 群組
//#endregion

init();

//#region  init初始化
function init() {
    getData();
    setDate(_date);
    setChineseDayAndID(_date.getDay());
    setMap();
}
//拉口罩api資料回來
function getData() {
    var xhr = new XMLHttpRequest();
    xhr.open('get', 'https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json', true);
    xhr.send(null); //ture非同步，不會等資料傳回來，就讓程式往下跑，等到回傳才會自動回傳
    //readystate = 4時才會觸發onload
    xhr.onload = function () {
        if (xhr.status == 200) {
            let xhrData = JSON.parse(xhr.responseText);
            let records = xhrData.features;
            for (let i = 0; i < records.length; i++) {
                let pharmacy = generatePharmacy(records[i].properties, records[i].geometry);
                _data.push(pharmacy);
                addMarker(pharmacy)
            }
            elmap.addLayer(markers);
            //console.log('getData =' + _data);
            if (_data.length == 0) {
                console.log('資料取回有誤');
            }
        }
        else {
            console.log('資料連線有誤');
        }
    }
}
function generatePharmacy(properties, geometry) {
    let pharmacy = {};
    pharmacy.name = properties.name;
    pharmacy.phone = properties.phone;
    pharmacy.address = properties.address;
    pharmacy.mask_adult = properties.mask_adult;
    pharmacy.mask_child = properties.mask_child;
    pharmacy.note = properties.note;
    pharmacy.county = properties.county;
    pharmacy.town = properties.town;
    pharmacy.cunli = properties.cunli;
    pharmacy.coordinates = geometry.coordinates;
    return pharmacy;
}
function setChineseDayAndID(day) {

    let chDay = '';
    let idCard = '';
    switch (day) {
        case 0:
            chDay = '星期日';
            idCard = '無限制'
            break;
        case 1:
            chDay = '星期一';
            idCard = '1,3,5,7,9';
            break;
        case 2:
            chDay = '星期二';
            idCard = '0,2,4,6,8';
            break;
        case 3:
            chDay = '星期三';
            idCard = '1,3,5,7,9';
            break;
        case 4:
            chDay = '星期四';
            idCard = '0,2,4,6,8';
            break;
        case 5:
            chDay = '星期五';
            idCard = '1,3,5,7,9';
            break;
        case 6:
            chDay = '星期六';
            idCard = '0,2,4,6,8';
            break;
    }
    document.getElementById('day').textContent = chDay;
    document.getElementById('idCard').textContent = idCard;
}
function setDate(d) {
    var month = d.getMonth() + 1;
    var day = d.getDate();
    var output = d.getFullYear() + '-' +
        (month < 10 ? '0' : '') + month + '-' +
        (day < 10 ? '0' : '') + day;
    document.getElementById('date').textContent = output;

}
function setMap() {
    //載入openstreetmap圖資
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 16,
        attribution: 'Chris makes'
    }).addTo(elmap);
}
//#endregion

//#region 處理畫面的method
function updateView() {    
    let searchName = document.querySelector('.search-name').value;
    let htmlStr = '';
    
    if (searchName === '') {
        alert('請輸入搜尋條件');
        return;
    }
   // console.log('updateView='+ _data);
    let  pharmacyData = _data.filter(element =>
        element.address.match(searchName) || element.name.match(searchName)
    );

    for (let i = 0; i < pharmacyData.length; i++) {
            let pharmacy = pharmacyData[i];
            let adultQty = parseInt(pharmacy.mask_adult);
            let childQty = parseInt(pharmacy.mask_child);
            let adultClass = getClassName(adultQty);
            let childClass = getClassName(childQty);
           
            htmlStr += `<div class="p-5 border-bottom">
                <div class="d-flex">
                    <div class="h4 font-weight-bold">${ pharmacy.name }   </div>
                    <a class="h4 ml-auto" href="#"  >
                        <i class="icon fas fa-map-marker-alt"  id="btnPath" data-lat="${pharmacy.coordinates[1]}" data-lng="${pharmacy.coordinates[0]}"></i>
                    </a>
                    <a  class="h4 ml-5"  id="btnRoute" target="_blank">
                        <i class="icon fas fa-location-arrow" data-address="${pharmacy.address}"></i>
                    </a>
                </div>
                <div class="h5">${ pharmacy.address}</div>
                <div class="h5">${ pharmacy.phone}</div>
                <div class="h5">${ pharmacy.note }</div>                         
                <div class="d-flex justify-content-between">
                    <div class="remaining ${ adultClass }">
                        <div class="h6">成人口罩</div>
                        <div class="h4">${ adultQty }</div>
                    </div>
                    <div class="remaining ${ childClass }">
                        <div class="h6">兒童口罩</div>
                        <div class="h4">${ childQty }</div>
                    </div>
                </div>
            </div>` 
         
    }
    elMapList.innerHTML = htmlStr;
}
function getClassName(qty) {
    let className = 'remaining-zero';
    if (qty > 100) {
        className ='remaining-alot';
    } 
    else if (qty>0)
    {
        className = 'remaining-seldom';
    }
    return className;
}
function addMarker(pharmacy)
{
    let adultQty = parseInt(pharmacy.mask_adult);
    let childQty = parseInt(pharmacy.mask_child);
    let adultClass = getClassName(adultQty);
    let childClass = getClassName(childQty);
    
    let grayIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let blueIcon = new L.Icon({
        iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
    let maskIcon = blueIcon; 
    if (adultQty == 0) {
        maskIcon = grayIcon;
    } 
    markers.addLayer(L.marker([pharmacy.coordinates[1]
        , pharmacy.coordinates[0]], { icon: maskIcon })
        .bindPopup(`    <div class="h6 font-weight-bold">${pharmacy.name}</div>
                        <small>${ pharmacy.address}</small><br/>
                        <small>${ pharmacy.phone}</small> <br/>                          
                        <small>${ pharmacy.note}</small>                           
                        <div class="d-flex justify-content-between mt-2">
                            <div class="remaining ${ adultClass}">
                                <div class="font-size-6px">成人口罩</div>
                                <div class="font-size-9px">${ adultQty}</div>
                            </div>
                            <div class="remaining ${ childClass}">
                                <div class="font-size-6px">兒童口罩</div>
                                <div class="font-size-9px">${ childQty}</div>
                            </div>
                        </div>`), {
        maxWidth: 250
    });    
}
function markerOpen (lat, lng) {
    // 搜尋 markers 圖層下的子圖層
    markers.eachLayer((layer) => {
        // 抓取圖層的 經緯度
        const eachLat = layer._latlng.lat;
        const eachLng = layer._latlng.lng;
        // 如果與參數的經緯度相同，就抓取那個 layer
        if (eachLat === lat && eachLng === lng) {
            // zoomToShowLayer 這個是 MarkerClusterGroup 給的函式
            // 方法是調用 MarkerClusterGroup 下的子圖層
            // 打開 bindPopup 的 HTML
            markers.zoomToShowLayer((layer), () => layer.openPopup());
        }
    });
};
function OpenPath(e)
{
    e.preventDefault();
    if (e.target.nodeName !== 'I') {
        return;
    }
    if (e.target.id ==='btnPath')
    {
        let lat = Number(e.target.dataset.lat);
        let lng = Number(e.target.dataset.lng);
        markerOpen(lat, lng);
    }
    else
    {
        let address = e.target.dataset.address;
        window.open("https://www.google.com.tw/maps/dir//" + address,"newwindow");
    }
    
}
//#endregion

//#region 事件
//隱藏與顯示side bar
elMenuIcon.addEventListener('click', function () {
    elSideBar.classList.toggle('hide');
    elMapContent.classList.toggle('hide');
})
btnSearch.addEventListener('click', updateView)
//點選各藥局資訊裡icon的事件
elMapList.addEventListener('click', OpenPath)
//#endregion

