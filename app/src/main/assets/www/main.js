let authToken;
let refToken;
let userId;
let editId;

/* Do login */
force.login(
	function () {
		console.log('Auth succeeded');
	},
	function (error) {
		console.log('Auth failed: ' + error);
	}
);

function logout() {
	var sfOAuthPlugin = cordova.require('com.salesforce.plugin.oauth');
	sfOAuthPlugin.logout();
}

function openCamera() {
	navigator.camera.getPicture(onSuccess, onFail, {
		quality: 35,
		destinationType: Camera.DestinationType.DATA_URL
	});

	function onSuccess(imageData) {

		let params = {

			path: 'services/apexrest/photo',
			method: 'POST',
			endPoint: '/',
			data:
				{
					userId: userId,
					communityId: '0DB6g000000XaXMGA0',
					basePhoto: imageData
				}
		};
		alert('Your photo start upload!');
		force.request(
			params,
			function successHandler() {

				force.login(
					function () {
						console.log('Auth succeeded');
					},
					function (error) {
						console.log('Auth failed: ' + error);
					}
				);
				alert('Your photo uploaded!');

			},
			function errorHandler(error) {
				console.log(error);
				alert('errorUpdate' + JSON.stringify(error));
			},
			true,
			false
		);
	}

	function onFail(message) {
		alert('Failed because: ' + message);
	}
}

function showUser(creds) {
	fetchRecords(creds.userId, function (data) {
		userId = creds.userId;
		let users = data.records;
		authToken = creds.accessToken;

		let name = users[0].Name;
		let mediumImg = users[0].SmallBannerPhotoUrl;

		let backImageHeader = ('https://na174.lightning.force.com/' + mediumImg + '?oauth_token=' +
			authToken);

		document.getElementsByClassName('logout-btn-container')[0].style.backgroundImage = 'url(\'' +
			backImageHeader + '\')';

		document.getElementById('hello').innerText = 'Welcome ' + users[0].FirstName;

		document.getElementById('photo').innerHTML =
			'<a onclick="openCamera()">' +
			'<img class="avatar" id ="photo-tag" src = "https://na174.lightning.force.com/' +
			users[0].MediumPhotoUrl +
			'?oauth_token=' +
			authToken + ' "></a>';

		document.getElementById('fname-text').innerText = users[0].FirstName;
		document.getElementById('lname-text').innerText = users[0].LastName;
		document.getElementById('nickname-text').innerText = users[0].CommunityNickname;
		document.getElementById('country-text').innerText = users[0].Country;
		document.getElementById('email-text').innerText = users[0].Email;
		document.getElementById('mobile-text').innerText = users[0].Phone;

	});
}


function salesforceSessionRefreshed(creds, oauth) {
	refToken = oauth.refresh_token;
	window.userID = creds.userId;
	showUser(creds);

}

var fetchRecords = function (credsId, successHandler) {
	var soql =
		'SELECT id,Name,Username, MobilePhone, Phone, SmallBannerPhotoUrl, CommunityNickname, MediumPhotoUrl, ' +
		'Alias,Country,Email,FirstName,LastName,IsPortalEnabled FROM User WHERE ID = \'' +
		credsId +
		'\'';
	force.query(soql, successHandler, function (error) {
		alert('Failed to fetch contacts: ' + error);
	});
};


function editFieldGetId(object) {
	editId = object.id;
	document.getElementById('value').placeholder = object.id;
	document.getElementById('value').type = 'text';
	if (editId === 'Phone') {
		document.getElementById('value').type = 'tel';
		document.getElementById('value').placeholder = '375_ _ _ _ _ _ _ _ _';
	}
	if (editId === 'Email') {
		document.getElementById('value').placeholder = 'Email@mail.ru';
		document.getElementById('value').type = 'email';
	}
	toggleModal();
}


function saveFieldAfterEdit() {
	var inputText = document.getElementById('value').value;

	if (inputText !== '') {
		force.update(
			'User',
			{'id': userId, [editId]: inputText},
			function successUpdate() {
				force.login(
					function () {
						console.log('Auth succeeded');
					},
					function (error) {
						console.log('Auth failed: ' + error);
					}
				);
				alert('Success');
				toggleModal();
			},
			function errorUpdate(error) {
				alert('errorUpdate' + error);
			}
		);
	} else {
		alert('Please, fill input field.');
	}
}

let modal = document.querySelector('.modal');
let trigger = document.querySelector('.trigger');
let closeButton = document.querySelector('.close-button');

function toggleModal() {
	modal.classList.toggle('show-modal');
}

function windowOnClick(event) {
	if (event.target === modal) {
		toggleModal();
	}
}

trigger.addEventListener('click', toggleModal);
closeButton.addEventListener('click', toggleModal);
window.addEventListener('click', windowOnClick);
