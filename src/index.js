import './scss/style.scss';

const output = document.getElementById("output");
const restoreBtn = document.getElementById("restore-btn");

const nextPageButton = document.querySelector(".next");
const prevPageButton = document.querySelector(".prev");
const currentPageNumber = document.querySelector(".curr-page");

const searchBtn = document.getElementById("search");
const searchInput = document.getElementById("search-input");
let currentPage = 1;
let setName;
let setRadioValue;
let dataGlobal = [];


const renderList = (elements) => {
  let index = 0;
  return elements
    .map(
      (current) =>
        `<li data-index="${index++}">
          <img src="${current.image}">
          <div class="wrap-item">
          <div class='name-content'>Имя:
              <p>${current.name}</p>
          </div>
          <div class='name-content'>Статус:
              <p> ${current.status}</p>
          </div>
          <div class='name-content'>Раса: 
              <p>${current.species}</p>
          </div>
          <button btn-name="delete">Delete Block</button>
      </div>
  </li>`
    )
    .join("");
};

async function fetchData(pagNum, searchInputValue, searchRadioValue) {
  let url = `https://rickandmortyapi.com/api/character/?page=${pagNum}`;
  if (searchInputValue) {
    url = `https://rickandmortyapi.com/api/character/?page=${pagNum}&name=${searchInputValue}`;
  }
  if (searchRadioValue) {
    url = `https://rickandmortyapi.com/api/character/?page=${pagNum}&name=${searchInputValue}&status=${searchRadioValue}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

//Кнопка вперед
nextPageButton.addEventListener("click", () => {
  currentPage++;
  currentPageNumber.textContent = currentPage;

  fetchData(currentPage, setName, setRadioValue).then((data) => {
    dataGlobal = data.results;
    if (data.info.next === null) {
      nextPageButton.setAttribute("disabled", true);
    }
    if (data.info.prev !== null) {
      prevPageButton.removeAttribute("disabled");
    }
    output.innerHTML = renderList(dataGlobal);
  });
});

//Кнопка назад
prevPageButton.addEventListener("click", () => {
  currentPage--;
  currentPageNumber.textContent = currentPage;

  fetchData(currentPage, setName, setRadioValue).then((data) => {
    dataGlobal = data.results;
    if (data.info.next !== null) {
      nextPageButton.removeAttribute("disabled");
    }
    if (data.info.prev === null) {
      prevPageButton.setAttribute("disabled", true);
    }
    output.innerHTML = renderList(dataGlobal);
  });
});

//Поиск персонажей
searchBtn.addEventListener("click", () => {
  // Если инпут пустая строка
  if (!searchInput.value) {
    openModal("Please enter a value in the search input field.");
    searchInput.value = "";
    return;
  }

  let selectedValue = null;
  const searchRadio = document.querySelector('input[name="status"]:checked');
  selectedValue = searchRadio ? searchRadio.value : null;

  // Поиск с учетом выбора radio или без него
  fetchData(currentPage, searchInput.value, selectedValue)
    .then((data) => {
      if(data.info.next === null){
        nextPageButton.setAttribute("disabled", true);
      }
      if(data.info.next){
        nextPageButton.removeAttribute("disabled");
      }
      dataGlobal = data.results;
      setName = searchInput.value;
      setRadioValue = selectedValue;
      searchInput.value = "";
      output.innerHTML = renderList(dataGlobal);
    })
    .catch(() => {
      searchInput.value = "";
      alert("Please enter a correct value in the search input field.");
    });
});

//Первый рендер и выбор LI
fetchData(currentPage).then((data) => {
  dataGlobal = data.results;
  currentPageNumber.textContent = currentPage;
  output.innerHTML = renderList(dataGlobal);

  //Добавление модального окна и затемнения
  function openModal() {
    const modal = document.querySelector("#modal");
    const closeButton = document.querySelector("#close-modal");
    const overlay = document.querySelector(".overlay");

    modal.style.display = "flex";
    overlay.style.display = "block";

    closeButton.addEventListener("click", () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    });

    overlay.addEventListener("click", () => {
      modal.style.display = "none";
      overlay.style.display = "none";
    });
  }

  output.addEventListener("click", (e) => {
    const modalContent = document.querySelector(".modal-content");
    let target = e.target.closest("li");
    if (target) {
      //Добавление обводки для LI с добавлением класса
      let allLi = document.querySelectorAll("li");
      allLi.forEach((li) => {
        li.classList.remove("active");
      });
      target.classList.add("active");

      //Вывод имени нажатой карточки
      const res = document.querySelector(".res span");
      res.textContent = target.querySelectorAll("p")[0].textContent;

      //Узнаем индекс LI и подставляемс с него данные
      const index = target.getAttribute("data-index");
      const modalData = dataGlobal[index];

      //Рендер инф. в модальном окне
      modalContent.innerHTML = `
      <h5>${modalData.name}</h5>
      <img src='${modalData.image}'> 
      <p>${modalData.species}</p> 
      `;

      //Удаления LI при нажатие на кнопку с атр.[btn-name="delete"]
      if (e.target.matches('button[btn-name="delete"]')) {
        target.remove();
        res.textContent = "";
      } else {
        openModal();
      }
    }
  });

  //Функционал кнопки Restor
  restoreBtn.addEventListener("click", () => {
    const listItems = document.querySelectorAll("li");
    const result = document.querySelector(".res span");
    if (listItems.length > 0) {
      listItems.forEach((item) => {
        item.remove();
        result.textContent = "";
      });
    }
    output.innerHTML = renderList(dataGlobal);
  });
});

