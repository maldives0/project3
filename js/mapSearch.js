import dragList from './dragList';

function PosChoice(lat, lng, content) {
    this.lat = lat;
    this.lng = lng;
    this.content = content;
};
let mapContainer = document.getElementById('map'),
    mapOption,
    map;
const geocoder = new kakao.maps.services.Geocoder();

function mapSearch(moveX, listLen, idxList, posChoice, findMeBtn, ulEle) {
    const listBox = document.querySelector('.listbox'),
        item = document.querySelectorAll('.item');
    dragList(moveX, listLen, idxList, item, listBox, ulEle);
    const latChoice = document.querySelectorAll('#lat');
    const lngChoice = document.querySelectorAll('#lng');

    const koChoice = document.querySelectorAll('#ko');
    const addressChoice = document.querySelectorAll('.address');
    const idxChoice = document.querySelectorAll('#idx');

    for (let i = 0; i < latChoice.length; i++) {
        (function (n) {
            idxChoice[n].append(n + 1);
        })(i);
        let latNum, lngNum = 0;
        latNum = Number(latChoice[i].textContent);
        lngNum = Number(lngChoice[i].textContent);
        posChoice.push(new PosChoice(latNum, lngNum, `${i + 1}. ` + koChoice[i].textContent));
    }

    // 주소로 좌표를 검색합니다
    geocoder.addressSearch(addressChoice[0].textContent, function (result, status) {
        // 정상적으로 검색이 완료됐으면 
        if (status === kakao.maps.services.Status.OK) {
            findMeBtn.addEventListener('click', (function (posChoice) {
                return function (e) { getFindMe(e, posChoice) }
            })(posChoice), false);
            markerEvent(posChoice, idxList, moveX, ulEle);
            regionNow(map);
        }
    });
}

function markerEvent(posChoice, idxList, moveX, ulEle) {
    mapContainer = document.getElementById('map'), // 지도를 표시할 div 
        mapOption = {
            center: new kakao.maps.LatLng(posChoice[0].lat, posChoice[0].lng), // 지도의 중심좌표
            level: 5 // 지도의 확대 레벨
        };

    const levelA = document.querySelectorAll('.level a'),
        levelInfo = document.querySelector('#mapLevel');

    levelA.forEach(function (a, i) {
        a.addEventListener('click',
            function () {
                let changeLevel = 2 * (i + 1);
                map.setLevel(changeLevel);
                levelInfo.innerHTML = `현재 지도 확대영역: ${this.textContent}`;
            });
    });
    map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

    let markerImage, markerClick, infowindow, marker;
    const imageSrc = "img/map-marker-point.png",
        // 마커 이미지의 이미지 크기 입니다
        imageSize = new kakao.maps.Size(40, 55);
    // 마커 이미지를 생성합니다    
    markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);
    const imageClick = "img/map-marker-click.png", // 마커이미지의 주소입니다    
        clickSize = new kakao.maps.Size(34, 43), // 마커이미지의 크기입니다
        clickOption = { offset: new kakao.maps.Point(15, 55) }; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    markerClick = new kakao.maps.MarkerImage(imageClick, clickSize, clickOption);
    // 마커가 표시될 위치입니다
    let idxMarker = 0;
    let arrMarker = [];
    let selectedMarker = null; // 클릭한 마커를 담을 변수
    for (var i = 0; i < posChoice.length; i++) {
        // 마커를 생성합니다
        marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: new kakao.maps.LatLng(posChoice[i].lat, posChoice[i].lng), // 마커를 표시할 위치
            title: posChoice[i].content, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
            image: markerImage, // 마커 이미지 
            clickable: true,
            zIndex: i,
        });
        marker.normalImage = markerImage;
        // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
        // 인포윈도우를 생성합니다
        infowindow = new kakao.maps.InfoWindow({
            content: posChoice[i].content,
            // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
        });
        // 마커가 지도 위에 표시되도록 설정합니다
        // 마커에 mouseover 이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'mouseover', function () {
            // 클릭된 마커가 없고, mouseover된 마커가 클릭된 마커가 아니면
            // 마커의 이미지를 오버 이미지로 변경합니다
            if (!selectedMarker || selectedMarker !== this) {
                idxMarker = this.getZIndex();
                this.setImage(markerClick);
                infowindow.open(map, this);
                infowindow.setContent('<div style="padding:5px;">' + posChoice[idxMarker].content + '</div>');
            }
        });
        // 마커에 mouseout 이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'mouseout', function () {
            // 클릭된 마커가 없고, mouseout된 마커가 클릭된 마커가 아니면
            // 마커의 이미지를 기본 이미지로 변경합니다
            if (!selectedMarker || selectedMarker !== this) {
                this.setImage(markerImage);
                infowindow.close();
            }
        });
        // 마커에 클릭이벤트를 등록합니다
        kakao.maps.event.addListener(marker, 'click', function () {
            idxMarker = this.getZIndex();
            // 클릭된 마커가 없거나, 전 click 마커가 현 클릭된 마커가 아니면
            // 마커의 이미지를 클릭 이미지로 변경합니다
            if (!selectedMarker || selectedMarker !== this) {
                // 클릭된 마커 객체가 null이 아니면
                // 전에 클릭된 마커의 이미지를 기본 이미지로 변경하고
                !!selectedMarker && selectedMarker.setImage(selectedMarker.normalImage);
                selectedMarker = this;
                // 현재 클릭된 마커의 이미지는 클릭 이미지로 변경합니다
                infowindow.open(map, this);
                infowindow.setContent(posChoice[idxMarker].content);
                this.setImage(markerClick);
                map.setCenter(new kakao.maps.LatLng(posChoice[idxMarker].lat, posChoice[idxMarker].lng));
                //해당 리스트로 드래그 좌표 움직이기
                setTimeout(function () { ulEle.style = "transform:translateX(" + (moveX * idxMarker) + "px);"; }, 100);
                idxList = idxMarker;
            }
            else {
                // 클릭된 마커가 있고, 전 click 마커가 현 클릭된 마커와 같다면
                selectedMarker.setImage(selectedMarker.normalImage);
                selectedMarker = null;
                infowindow.close();
            }
        });//click
        arrMarker.push(marker);
    };

    const item = document.querySelectorAll('.listbox .item');
    item.forEach(function (clickedItem, itemIdx) {
        clickedItem.addEventListener('dblclick', function () {
            if (!selectedMarker || selectedMarker !== arrMarker[itemIdx]) {
                // 클릭된 마커 객체가 null이 아니면
                // 전에 클릭된 마커의 이미지를 기본 이미지로 변경하고
                !!selectedMarker && selectedMarker.setImage(selectedMarker.normalImage);
                selectedMarker = arrMarker[itemIdx];
                infowindow.open(map, arrMarker[itemIdx]);
                infowindow.setContent(posChoice[itemIdx].content);
                arrMarker[itemIdx].setImage(markerClick);
                map.setCenter(new kakao.maps.LatLng(posChoice[itemIdx].lat, posChoice[itemIdx].lng));
                setTimeout(function () { ulEle.style = "transform:translateX(" + (moveX * itemIdx) + "px);"; }, 100);
                idxList = itemIdx;
            } else {
                // 클릭된 마커가 있고, 전 click 마커가 현 클릭된 마커와 같다면
                selectedMarker.setImage(selectedMarker.normalImage);
                selectedMarker = null;
                infowindow.close();
            }
        });
    });
};

export function getFindMe(e, posChoice) {
    map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다
    let locPosition, message;
    // HTML5의 geolocation으로 사용할 수 있는지 확인합니다 
    if (navigator.geolocation) {
        // GeoLocation을 이용해서 접속 위치를 얻어옵니다
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = position.coords.latitude, // 위도
                lon = position.coords.longitude; // 경도
            locPosition = new kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
                message = '여기에 계신가요?!'; // 인포윈도우에 표시될 내용입니다
            // 마커와 인포윈도우를 표시합니다
            posChoice.push(new PosChoice(lat, lon, message));
            let arrContent = [], answer = [], posFilter = [];
            for (let j = 0; j < posChoice.length; j++) {
                arrContent.push(posChoice[j].content);
                answer = arrContent.filter((v, i) => {
                    return v !== arrContent[i + 1];
                });
                if (answer[j] === posChoice[j].content) {
                    posFilter.push(posChoice[j]);
                }
            }
            markerEvent(posFilter);
            map.setCenter(locPosition);
            regionNow(map);
        });
    } else { // HTML5의 GeoLocation을 사용할 수 없을 때 마커 표시 위치와 인포윈도우 내용을 설정합니다
        locPosition = new kakao.maps.LatLng(posChoice[0].lat, posChoice[0].lng),
            message = 'geolocation을 사용할수 없어요..'
        map.setCenter(locPosition);
    }
};

function regionNow(map) {
    searchAddrFromCoords(map.getCenter(), displayCenterInfo);
    // 중심 좌표나 확대 수준이 변경됐을 때 지도 중심 좌표에 대한 주소 정보를 표시하도록 이벤트를 등록합니다
    kakao.maps.event.addListener(map, 'idle', function () {
        searchAddrFromCoords(map.getCenter(), displayCenterInfo);
    });
    function searchAddrFromCoords(coords, callback) {
        // 좌표로 행정동 주소 정보를 요청합니다
        geocoder.coord2RegionCode(coords.getLng(), coords.getLat(), callback);
    }
    // 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
    function displayCenterInfo(result, status) {
        if (status === kakao.maps.services.Status.OK) {
            const regionInfo = document.querySelector('#hereNow');
            for (var i = 0; i < result.length; i++) {
                // 행정동의 region_type 값은 'H' 이므로
                if (result[i].region_type === 'H') {
                    regionInfo.innerHTML = '현위치 : ' + result[i].address_name;
                    break;
                }
            }
        }
    }
};

export default mapSearch;