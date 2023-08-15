window.addEventListener('load', async () => {
  // temp
  try {
    const brandSlug = await getBrandSlugFromUrl();
    if(brandSlug) {
      await Wized.data.setVariable("brandslug", brandSlug);
    }
    
    const singleBrandResponse = await Wized.request.execute("Get a single brand");
    // console.log(singleBrandResponse);
    setMetadata(singleBrandResponse);
    const parentCategories = await Wized.request.execute("Get all categories");
    const subcategoriesResponse = await Wized.request.execute("Get subcategories from ids");
    await parseMarkdownGeneral(brandBio);
  
    // Gallery
    const galleryArrayObject = singleBrandResponse.data.data.items[0].fields.gallery;
    if(galleryArrayObject === undefined) {
      console.log("Empty gallery");
    } else {
      const galleryItemIds = await extractSysIds(galleryArrayObject);
      await Wized.data.setVariable("brandgalleryassets", galleryItemIds);
      const brandGalleryResponse = await Wized.request.execute("Get assets from ids (gallery)");  
    }

    await showMediaWrapper(singleBrandResponse);

    await hideFeaturedImageIfBlank(singleBrandResponse);

    
    async function extractSysIds(data) {
      const outputArray = [];
    
      data.forEach((item) => {
        if (item.sys && item.sys.id) {
          outputArray.push(item.sys.id);
        }
      });
    
      return outputArray;
    }
      
      $(".full-screen-loader").fadeOut();
      $("#brandQuotePaid").prepend(`"`);
      $("#brandQuotePaid").append(`"`);
      $("#brandQuoteFree").prepend(`"`);
      $("#brandQuoteFree").append(`"`);
      await organiseCategoriesAndSubcategories(parentCategories);
      await displayPromotions(singleBrandResponse);
      await displayBrandStores(singleBrandResponse);
      // const assetsArray = [];
      // await parseNestedAssets(singleBrandResponse);
      // await sendAssetsToWized(assetsArray);
      getFeaturedBrandsAndIds();
      await nestSubcategoriesInCategories();

  } catch (error) {
      console.log(error);
  }
});


function setMetadata(brandResponse) {
  const brandName = brandResponse.data.data.items[0].fields.name;
  const brandDescription = brandResponse.data.data.items[0].fields.description;
  document.title = brandName + " | Miigle+"
  // Set or modify the meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    // If the meta description doesn't exist, create a new <meta> tag
    metaDescription = document.createElement('meta');
    metaDescription.setAttribute('name', 'description');
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute('content', brandDescription);
}

// Move sub-categories inside parent category wrappers  
function organiseCategoriesAndSubcategories(parentCategories) {
      var childElements = $('.single-brand__subcategory-wrapper');
      if(childElements.length > 0) {
        childElements.each(async function() {
          var childElement = $(this);
          var parentCategoryId = childElement.attr('parentcategoryid');
    
          var parentElement = $('.single-brand__category-wrapper[parentcategoryid="' + parentCategoryId + '"]');
    
          parentElement.append(childElement);
          
          // Update names of parentCategories
          let parentCategoriesItemsObj = parentCategories.data.data.items;
          var elements = $("*[data-contentful='parentCategory']");
    
          elements.each(function() {
              var element = $(this);
              var parentCategoryId = element.parent().attr('parentcategoryid');
    
              var nestedParentCategory = parentCategoriesItemsObj.find(function(item) {
              return item.sys.id === parentCategoryId;
              });
    
              if (nestedParentCategory) {
              var name = nestedParentCategory.fields.text;
              element.text(name);
              }
          });
        });
      }
}

async function getBrandSlugFromUrl() {
  try {
    // Get the current URL
    const currentUrl = window.location.href;

    // Extract the portion after "/brand/" and before the "?"
    const extractedValue = currentUrl.match(/\/brand\/([^?]+)/)[1];

    return(extractedValue); // Output: patagonia
  } catch(error) {
      console.log(error);
  }
}
async function nestSubcategoriesInCategories() {
  const subcategoryWrappers = document.querySelectorAll('.single-brand__subcategory-wrapper');
  const categoryWrappers = document.querySelectorAll('.single-brand__category-wrapper');

  subcategoryWrappers.forEach(subcategoryWrapper => {
    const parentCategoryId = subcategoryWrapper.getAttribute('parentcategoryid');

    categoryWrappers.forEach(categoryWrapper => {
      if (categoryWrapper.getAttribute('parentcategoryid') === parentCategoryId) {
        categoryWrapper.appendChild(subcategoryWrapper);
      }
    });
  });
}

async function displayPromotions(singleBrandResponse) {
  if(singleBrandResponse.data.data.items[0].fields.promotions){
    const promotionObjectFromBrand = singleBrandResponse.data.data.items[0].fields.promotions;
    const promotionArrayFromBrand = promotionObjectFromBrand.map(item => item.sys.id);
    const promotionArrayResponse = await Wized.data.setVariable("promotionarray", promotionArrayFromBrand);
    const promotionsData = await Wized.request.execute("Get promotions from ids");
  } else {
  }
}

async function displayBrandStores(singleBrandResponse) {
  if(singleBrandResponse.data.data.items[0].fields.brandStores) {
    const brandStoresObjectFromBrand = singleBrandResponse.data.data.items[0].fields.brandStores;
    const brandStoresArrayFromBrand = brandStoresObjectFromBrand.map(item => item.sys.id);
    const brandStoresArrayResponse = await Wized.data.setVariable("brandstoresarray", brandStoresArrayFromBrand);
    const brandStoresData = await Wized.request.execute("Get brandStores from ids");
  } else {
  }
  
}


// Identify the IDs of any assets attached to this brand
async function parseNestedAssets(data) {
for (const key in data) {
  if (typeof data[key] === 'object' && data[key] !== null) {
    if (data[key].sys && data[key].sys.type === 'Link' && data[key].sys.linkType === 'Asset') {
      assetsArray.push(data[key].sys.id);
    } else {
      parseNestedAssets(data[key]);
    }
  }
}
}

async function sendAssetsToWized(assetsArray) {
  if(assetsArray.length > 0) {
    const assetsArrayResponse = await Wized.data.setVariable("assetsarray", assetsArray);
    const getAssetsResponse = await Wized.request.execute("Get assets from ids (all)");
    //console.log(getAssetsResponse);
    updateBackgroundImagesFromAssetsObject(getAssetsResponse);
  } else {
  }
}

async function hideFeaturedImageIfBlank(singleBrandResponse) {
  if(singleBrandResponse.data.data.items[0].fields.image === undefined) {
    $(".single-brand__header__image").hide();
  }
}

function updateBackgroundImagesFromAssetsObject(data) {
  const items = data.data.data.items; // Access the "items" array in the nested structure

  // Step 1: Go through the JSON object
  for (const item of items) {
    const sysId = item.sys.id; // Get the "sys.id" value
    const fileUrl = item.fields.file.url; // Get the "fields.file.url" value

    // Step 3: Go through the page elements
    const elements = document.querySelectorAll('[contentfulassetid]');

    // Step 4: Match the nested item in the JSON object with the relevant page element
    for (const element of elements) {
      const contentfulAssetId = element.getAttribute('contentfulassetid');
      if (sysId === contentfulAssetId) {
        // Step 5: Update the src attribute of the matched element
        element.src = fileUrl;
      }
    }
  }
}


async function parseMarkdownGeneral(elem) {
  let rawContent = $(elem).text();
  await $(elem).html(marked.parse(rawContent));
}

// Hide media wrapper
    async function showMediaWrapper(singleBrandResponse) {
      if (singleBrandResponse.data.data.items[0].fields.featured === true) {
        if(singleBrandResponse.data.data.items[0].fields.videoFile === undefined &&
          singleBrandResponse.data.data.items[0].fields.videoUrl === undefined &&
          singleBrandResponse.data.data.items[0].fields.gallery === undefined) {
        } else {
          $(".single-brand__media").show();
        }
      }
      if (singleBrandResponse.data.data.items[0].fields.featured !== true) {
          if(singleBrandResponse.data.data.items[0].fields.image === undefined &&
            singleBrandResponse.data.data.items[0].fields.videoFile === undefined &&
            singleBrandResponse.data.data.items[0].fields.videoUrl === undefined &&
            singleBrandResponse.data.data.items[0].fields.gallery === undefined) {
          } else {
              $(".single-brand__media").show();
          }
      }
  }