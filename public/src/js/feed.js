var shareImageButton = document.querySelector('#install');
var createPostArea = document.querySelector('#create-post');
// var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var content = document.querySelector('#content')

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

// closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function (cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'col';

  var card = document.createElement('div');
  card.className = 'card border-danger';

  var cardImage = document.createElement('img');
  cardImage.src = data.image;
  cardImage.className = 'card-img-top image-fluid';
  cardImage.style.width = "180.91xpx"
  cardImage.style.height = "200px"

  cardImage.alt = '...';
  card.appendChild(cardImage);

  var cardBody = document.createElement('div');
  cardBody.className = 'card-body border-top border-danger';
  // cardBody.style.borderTop = "border border-danger"

  var cardTitle = document.createElement('h5');
  cardTitle.className = 'card-title';
  cardTitle.textContent = data.location;
  cardBody.appendChild(cardTitle);

  var cardButton = document.createElement('button');
  cardButton.type = 'button';
  cardButton.className = 'btn btn-danger';
  cardButton.textContent = 'Description';
  cardBody.appendChild(cardButton);

  card.appendChild(cardBody);

  cardWrapper.appendChild(card);

  sharedMomentsArea.appendChild(cardWrapper);

  // buat detail page berdasarkan datanya
  // Add click event listener to each card
  // card.addEventListener('click', function() {
  //   createDetailPage(data);
  // });
  if (navigator.onLine) {
    // The browser is in online mode
    console.log("Browser is online");
  } else {
    // The browser is in offline mode
    console.log("Browser is offline");
  }

  // Add a click event listener to the card button
  card.addEventListener('click', function () {
    // Encode data values before constructing the URL
    const idParam = encodeURIComponent(data.id)
    const locationParam = encodeURIComponent(data.location);
    const imageParam = encodeURIComponent(data.image);
    const descriptionParam = encodeURIComponent(data.description);

    //   // Store data in localStorage
    //   // localStorage.setItem('id', idParam);
    //   // localStorage.setItem('location', locationParam);
    //   // localStorage.setItem('image', imageParam);
    //   // localStorage.setItem('description', descriptionParam);
    const dataObject = {
      id: idParam,
      location: locationParam,
      image: imageParam,
      description: descriptionParam
    };
    localStorage.setItem(idParam, JSON.stringify(dataObject));

    //   // Construct the URL with encoded data values
    const url = `detail.html?id=${idParam}`;
    //   // const url = `detail.html?location=${locationParam}&image=${imageParam}&description=${descriptionParam}`;

    //   // Open the corresponding HTML page in a new tab
    window.location.href = url;
  });
}

// function createDetailPage(data) {
//   card.addEventListener('click', function () {
//     if (!!navigator.onLine) {
//       const storedData = localStorage.getItem(data.id);
//       if (storedData) {
//         const dataObject = JSON.parse(storedData);
//         const location = decodeURIComponent(dataObject.location);
//         const image = decodeURIComponent(dataObject.image);
//         const description = decodeURIComponent(dataObject.description);
//         const url = `detail.html?id=${idParam}`;
//         window.location.href = url;
//       }
//     } else {
//       const cardMarkup = `
//           <div class="card mb-3 border-danger" style="max-width: 1000px;">
//             <div class="row g-0">
//               <div class="col-md-4">
//                 <img src="${data.image}" class="img-fluid rounded-start" alt="${data.location}" style="width:300px; height:220px;">
//               </div>
//               <div class="col-md-8">
//                 <div class="card-body text-danger">
//                   <h3 class="card-title">${data.location}</h3>
//                   <p class="card-text">${data.description}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         `;
//       console.log('online')
//       // Append the card markup to the sharedMomentsArea
//       content.innerHTML = cardMarkup;
//       const url = `detail.html?id=${data.id}`;
//       window.location.href = url;
//     }
//   });
// }



function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = 'https://whatdoiknow-f2429-default-rtdb.firebaseio.com/posts.json';
var networkDataReceived = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}
