; (function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'

  // 儲存所有電影資料
  const data = []
  // 渲染所有電影資料的 DOM
  const dataPanel = document.getElementById('data-panel')
  // 搜尋功能的 DOM
  const searchForm = document.getElementById('search')
  const searchInput = document.getElementById('search-input')
  // 分頁功能的 DOM
  const pagination = document.getElementById('pagination') // 用 DOM 選到 HTML 裡面的分頁 UI
  const ITEM_PER_PAGE = 12 // 令每個分頁裡的電影數量為 12 (數字)



  // change view 功能的 DOM
  const viewChange = document.getElementById('view-type-icon')
  let viewType = 'card' // 畫面一開始預設為 card 的樣式

  // 取得 API 資料後，要做什麼事情
  axios
    .get(INDEX_URL)
    .then(response => {
      data.push(...response.data.results)
      // displayDataList(data) //引入分頁後，需要被註解掉，不然會跟 get page data 打架
      getTotalPages(data) // 將總分頁數量的 UI 渲染
      getPageData(1, data)
    })
    .catch(err => console.log(err))

  // A28 作業 - 當點擊到 list / card view ˊ的反應

  viewChange.addEventListener('click', event => {
    console.log(this)
    console.log(event.target)
    if (event.target.classList.contains('fa-bars') === true) {
      viewType = 'List'
      console.log(viewType)
    } else if (event.target.classList.contains('fa-th') === true) {
      viewType = 'card'
      console.log(viewType)
    }
    displayDataList(data) // 記得要再 display 一次！
  })

  // 依據資料內容與呈現格式，產生 HTML
  function displayDataList(data) {
    let htmlContent = ``
    // 判斷 view type 來新增對應的 HTML
    if (viewType === 'List') {
      htmlContent = '<ul class="list-group w-100 mb-3">'
      data.forEach(function (item, index) {
        htmlContent += `
        <li class="list-group-item d-flex justify-content-between align-items-center">${item.title}
        <div>
        <!-- More button --> 
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
        <!-- favorite button --> 
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>`
      })
      htmlContent += `</ul>`
    } else if (viewType === 'card') {
      data.forEach(function (item, index) {
        htmlContent += `
        <div class="col-sm-3">
          <div class="card mb-2">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body movie-item-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <!-- "More" button -->
            <div class="card-footer">
              <!-- More button --> 
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button --> 
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
          </div>
        </div>
      `
      })
    }
    dataPanel.innerHTML = htmlContent
  }

  // 	--------------
  //  ------ 監聽器區 --------

  // 實作點擊 "More" 會出現更多影片資訊
  dataPanel.addEventListener('click', event => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id) // 點擊 More 顯示更多影片資訊
    } else if (event.target.matches('.btn-add-favorite')) {
      addFavoriteItem(event.target.dataset.id) // 點擊收藏，將資料加入
    }
  })

  // 搜尋功能
  // 將搜尋 UI 裝上監聽器
  searchForm.addEventListener('submit', event => {
    event.preventDefault() // 移除瀏覽器預設

    // 在還沒有作分頁前，實作搜尋的方式
    // let input = searchInput.value.toLowerCase()
    // let results = data.filter(movie =>
    //   movie.title.toLowerCase().includes(input)
    // )

    // 實作分頁後，製作搜尋的方式
    let results = []
    const regex = new RegExp(searchInput.value, 'i')

    results = data.filter(movie => movie.title.match(regex))
    console.log(results)
    // displayDataList(results) // 加入分頁後需註解掉，不然會跟分頁的顯示打架
    getTotalPages(results)
    getPageData(1, results)
  })

  // 實作分頁
  // 單頁希望顯示 12 筆電影資訊，需要全部資料 /12 轉為分頁數量，才知道需要多少個 UI 分頁
  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i +
        1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  // 點擊分頁的頁碼後，切換分頁
  pagination.addEventListener('click', event => {
    console.log(event.target.dataset.page)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page) // 用 getPageData 這個函數運算我要呈現的分頁內容
    }
  })

  let paginationData = []

  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData) // 計算完要呈現的電影內容，用 displayDataList 在畫面上呈現
  }

  //  ------  Function 區 --------

  // 彈出框的功能 - 點按 More ，會呈現對應的電影資訊
  function showMovie(id) {
    // 先用 DOM 選出需要被修改的 HTML 元素
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')
    // 整合正確的 API 網址
    const url = INDEX_URL + id
    console.log(url)
    // 用正確的 URL 發 request 給 show API
    axios.get(url).then(response => {
      const data = response.data.results
      console.log(data)
      // 把電影內容塞進 modal 彈出框中
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
    })
  }

  // 將收藏的電影送進 local storage 儲存
  // 使用 local storage 要注意 local storage 裡的 value 是 string type，也就是存入 data 時需要呼叫 JSON.stringify(obj)，而取出時需要呼叫 JSON.parse(value)
  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || [] //若使用者是第一次使用收藏功能，則 localStorage.getItem('favoriteMovies') 會找不到東西，所以需要建立一個空 Array
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      // some 用來判斷是否清單中已有相同的電影，如果沒有則會新增。
      alert(`已經收藏過 ${movie.title} 這部電影了`)
    } else {
      list.push(movie)
      alert(`成功將 ${movie.title} 加入收藏名單中`)
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  // 最外層 function 的 close
})()
