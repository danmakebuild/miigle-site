let categories = [];

async function loadData() {
  try {
    console.log("loadData run");
	  showBrandDirectoryLoader();
    const brandsResponse = await Wized.request.execute("Get all brands");
    //console.log(brandsResponse);
    const categoriesResponse = await Wized.request.execute("Get all categories");
    
    const contentfulCategoriesObject = categoriesResponse.data.data.items;

    // Create a new array to store the categories for each page
    const pageCategories = [];

    contentfulCategoriesObject.forEach((obj) => {
      const text = obj.fields.text;
      const id = obj.sys.id;
      const category = { text, id };
      pageCategories.push(category);
    });

    // Update the global categories array with the categories for the current page
    categories = pageCategories;

    // Call attachCategoriesToBrands after populating the categories array
    attachCategoriesToBrands(categories);
		preparePagination();
    
  hideBrandDirectoryLoader();
  } catch (error) {
    console.log(error);
  }
}

// Prepare pagination buttons
async function preparePagination() {
  try {
    const brandDirectoryPaginationCanNext = await Wized.data.get("v.branddirectorypaginationcannext");

    if (brandDirectoryPaginationCanNext === "false" || brandDirectoryPaginationCanNext === false) {
      $("#brandDirectoryPageNext").addClass("disabled");
    } else {
      $("#brandDirectoryPageNext").removeClass("disabled");
    }

    const brandDirectoryPaginationCanPrev = await Wized.data.get("v.branddirectorypaginationcanprev");

    if (brandDirectoryPaginationCanPrev === "false" || brandDirectoryPaginationCanPrev === false) {
      $("#brandDirectoryPagePrev").addClass("disabled");
    } else {
      $("#brandDirectoryPagePrev").removeClass("disabled");
      
    }
  } catch (error) {
    console.error("Error occurred during API calls: ", error);
  }
}


window.addEventListener("load", async (event) => {
  const categoriesForFiltersResponse = await Wized.request.execute("Get all categories - filters");
  console.log("categories loaded");
  setTimeout(async function() {
    await checkForCategoryUrlParams();
  }, 1000);
  const badgesForFiltersResponse = await Wized.request.execute("Get all badges - filters");
  const targetMarketsResponse = await Wized.request.execute("Get all target markets");
});

function attachCategoriesToBrands(categories) {
  // loop through all elements with a category-id attribute
  const elements = document.querySelectorAll('[category-id]');
  for (let i = 0; i < elements.length; i++) {
    const categoryID = elements[i].getAttribute('category-id');

    // find the corresponding category object
    const category = categories.find(cat => cat.id === categoryID);

    // update the element's contents with the category text
    if (category) {
      elements[i].textContent = category.text;
    }
  }
}


// Filtering by category
const categoryFilters = document.getElementById("categoryFilters");
categoryFilters.addEventListener("change", handleCategoryFilterChange);

function handleCategoryFilterChange(event) {
  const categoryCheckboxes = categoryFilters.querySelectorAll('input[type="checkbox"]');
  const selectedCategories = Array.from(categoryCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.getAttribute("id"));
    
  const allCategories = Array.from(categoryCheckboxes)
    .map(checkbox => checkbox.getAttribute("id"));

if(selectedCategories.length < 1) {
    filterCategories(allCategories);
} else {
    filterCategories(selectedCategories);
}
}

async function filterCategories(filterCategoriesArray) {
	try {
  	await Wized.data.setVariable("branddirectoryskip", 0);
  	var filterCategoriesStr = filterCategoriesArray.join(",");
    await Wized.data.setVariable("branddirectoryfiltercategories", filterCategoriesStr);
    brandDirectoryPageTurn(0);
    loadData();
	} catch (error) {
  	console.log(error);
	}
}

// Filtering by targetMarkets
const targetMarketFilters = document.getElementById("targetMarketFilters");
targetMarketFilters.addEventListener("change", handleTargetMarketFilterChange);

function handleTargetMarketFilterChange(event) {
    
  const targetMarketCheckboxes = targetMarketFilters.querySelectorAll('input[type="checkbox"]');
    
  const selectedTargetMarkets = Array.from(targetMarketCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.getAttribute("id"));
    
  const allTargetMarkets = Array.from(targetMarketCheckboxes)
    .map(checkbox => checkbox.getAttribute("id"));

if(selectedTargetMarkets.length < 1) {
    filterTargetMarkets(allTargetMarkets);
} else {
  filterTargetMarkets(selectedTargetMarkets);
}
}

async function filterTargetMarkets(filterTargetMarketsArray) {
	try {
  	await Wized.data.setVariable("branddirectoryskip", 0);
  	var filterTargetMarketsStr = filterTargetMarketsArray.join(",");
    await Wized.data.setVariable("branddirectoryfiltertargetmarkets", filterTargetMarketsStr);
    console.log(filterTargetMarketsStr);
    brandDirectoryPageTurn(0);
    loadData();
	} catch (error) {
  	console.log(error);
	}
}


// Filtering by badge
const badgeFilters = document.getElementById("badgeFilters");
badgeFilters.addEventListener("change", handleBadgeFilterChange);

function handleBadgeFilterChange(event) {
    
  const badgeCheckboxes = badgeFilters.querySelectorAll('input[type="checkbox"]');
    
  const selectedBadges = Array.from(badgeCheckboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.getAttribute("id"));
    
  const allBadges = Array.from(badgeCheckboxes)
    .map(checkbox => checkbox.getAttribute("id"));

if(selectedBadges.length < 1) {
    // console.log("no filters, so include all badges in the array");
    filterBadges(allBadges);
} else {
    // console.log("some filters selected, so include some categories in the array");
    filterBadges(selectedBadges);
}
}

async function filterBadges(filterBadgesArray) {
	try {
  	await Wized.data.setVariable("branddirectoryskip", 0);
  	var filterBadgesStr = filterBadgesArray.join(",");
    await Wized.data.setVariable("branddirectoryfilterbadges", filterBadgesStr);
    loadData();
	} catch (error) {
  	console.log(error);
	}
}

// Featured status filtering
const featuredFilter = document.getElementById("featuredFilter");
featuredFilter.addEventListener("change", handleFeaturedFilterChange);

function handleFeaturedFilterChange(event) {
    if (event.target.checked) {
        filterFeatured("true");
    } else {
        filterFeatured("false,true");
    }
}

async function filterFeatured(filterFeaturedStatus) {
	try {
    await Wized.data.setVariable("branddirectoryfilterfeatured", filterFeaturedStatus);
    await brandDirectoryPageTurn(0);
    loadData();
	} catch (error) {
  	console.log(error);
	}
}

// Sorting functionality
const sortOrderSelect = document.getElementById("sortOrderSelect");
sortOrderSelect.addEventListener("change", handleSortOrderChange);

function handleSortOrderChange(event) {
    const selectedOption = event.target.value;
  
    if (selectedOption === "fields.name") {
        // Filter ascending order
        sortBrands(selectedOption);
    } else if (selectedOption === "-fields.name") {
        // Filter descending order
        sortBrands(selectedOption);
    }
}

async function sortBrands(sortOrder) {
	try {
    await brandDirectoryPageTurn(0);
    await Wized.data.setVariable("branddirectorysortorder", sortOrder);
    loadData();
	} catch (error) {
  	console.log(error);
	}
}



// Page turn
async function brandDirectoryPageTurn(skip) {
  try {
  var currentSkip = parseInt(await Wized.data.get("v.branddirectoryskip"));
  var currentPage = parseInt(await Wized.data.get("v.branddirectorycurrentpage"));
	var newPage = (currentPage + (skip / 15));
    await Wized.data.setVariable("branddirectorycurrentpage", newPage);
    if(isNaN(currentSkip)) {
				await Wized.data.setVariable("branddirectoryskip", skip);
		    await loadData();
    } else {
				var newSkip = currentSkip + skip;
				await Wized.data.setVariable("branddirectoryskip", newSkip);
		    await loadData();
    }
  } catch (error) {
    console.log(error);
  }
}

$(document).ready(function() {
  var brandDirectoryPerPage = 15;
  $("#brandDirectoryPageNext").click(function() {
    brandDirectoryPageTurn(brandDirectoryPerPage);
  });
  $("#brandDirectoryPagePrev").click(function() {
    brandDirectoryPageTurn((brandDirectoryPerPage * -1));
  });

  $("#brand-search-submit--brand-directory").click(async function(){
    showSearchResults();
    updateQueryParam();
    location.reload();
  });
  document.getElementById("brand-search-submit--home").addEventListener("click", loadData);
});

function showBrandDirectoryLoader(){
  $("#brandDirectoryLoader").addClass("show");
}
function hideBrandDirectoryLoader(){
  $("#brandDirectoryLoader").removeClass("show");
}



async function checkForCategoryUrlParams() {
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);

  var hasSearchTerm = urlParams.has('q');
  var hasCategoryFilter = urlParams.has('category');

  if(hasSearchTerm === true) {	
    // Query filtering is handled by Wized through URL parameter
    var searchTerm = urlParams.get('q');
    $("#brand-search-field--brand-directory").val(searchTerm);
    showSearchResults();
    await loadData();
  }

  if(hasCategoryFilter === true) {
    showSearchResults();
    var categoryFilter = urlParams.get('category').toLowerCase();
    clickCategoryFilter(categoryFilter);
  }

  if(hasSearchTerm === false && hasCategoryFilter === false) {
    loadData();
  }
}

function clickCategoryFilter(category) {
const labelElements = document.querySelectorAll('#categoryFilters label');

for (const label of labelElements) {
  if (label.textContent.toLowerCase() === category.toLowerCase()) {
    label.click();
    break;
  }
}
}

function showSearchResults() {
  $(".brand-directory").removeClass("hide");
  $(".discover-miigle__featured").addClass("hide");
}

// Add frame to featured brands
$(".discover__featured__brands-list .featured-brand:nth-child(1)").find(".img-mask-frame").addClass("mask--blob");
$(".discover__featured__brands-list .featured-brand:nth-child(2)").find(".img-mask-frame").addClass("mask--diamond");
$(".discover__featured__brands-list .featured-brand:nth-child(3)").find(".img-mask-frame").addClass("mask--blob");
$(".discover__featured__brands-list .featured-brand:nth-child(4)").find(".img-mask-frame").addClass("mask--flower");

// TODO: fix this so it works

function updateQueryParam() {
  // Get the value of the input element
  var inputValue = document.getElementById('brand-search-field--brand-directory').value;

  // Get the current URL
  var url = window.location.href;

  // Check if the URL already has a "q" parameter
  if (url.indexOf('?') > -1) {
    // URL has existing parameters
    var urlParts = url.split('?');
    var baseUrl = urlParts[0];
    var params = urlParts[1].split('&');
    var updatedParams = [];

    // Loop through existing parameters and update "q" if found
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split('=');
      if (param[0] === 'q') {
        updatedParams.push('q=' + encodeURIComponent(inputValue));
      } else {
        updatedParams.push(params[i]);
      }
    }

    // Update the URL with the modified parameters
    url = baseUrl + '?' + updatedParams.join('&');
  } else {
    // URL does not have any parameters
    url += '?q=' + encodeURIComponent(inputValue);
  }

  // Update the browser URL
  history.replaceState(null, null, url);
}


$(".brand__category__link-button").click(function(){
  showSearchResults();
});
$(".discover-miigle__search__form__field").keyup(function(event) {
  showSearchResults();
});