// This script is referenced inline inside the featured brands widget component
// Get featured brands and ids
async function getFeaturedBrandsAndIds() {
  try {
    const totalResponse = await Wized.request.execute("Get featured brands total");
    
    const featuredBrandsTotal = await Wized.data.get("v.featuredbrandstotal");
    
    await featuredBrandsRandomSkipNumber(featuredBrandsTotal);

    const response = await Wized.request.execute("Get featured brands");

    const brandEntries = response.data.data.items;
    
    const featuredBrandAssetIds = await getAssetIdsFromBrands(brandEntries);
    
    await Wized.data.setVariable("featuredbrandsarray", featuredBrandAssetIds);
    const featuredBrandEntries = await Wized.request.execute("Get assets from ids");
    
    await replaceImageSrc(featuredBrandEntries);

    await addMasksToFeaturedBrandImages();

    await featuredBrandsWidgetSlickify();

    
    
    // Do something with the itemIds array
  } catch (error) {
    console.error(error);
    // Handle any errors that occur during the execution or parsing
  }
}

async function getAssetIdsFromBrands(items) {
  const itemIds = [];

  for (const item of items) {
    const sysId = item.fields.image.sys.id;
    itemIds.push(sysId);
  }

  await Wized.data.setVariable("featuredbrandsimagesids", itemIds);
  return itemIds;
}

async function replaceImageSrc(featuredBrandEntries) {
  const items = featuredBrandEntries.data.data.items;
  items.forEach(item => {
    const url = item.fields.file.url;
    const element = document.querySelector(`.discover-miigle__featured img[contentfulassetid="${item.sys.id}"]`);
    console.log(`${item.sys.id}`);
    if (element) {
      element.src = url;
    }
  });
}

// Determine the random skip number for featured brands widget, based on total number of featured brands
async function featuredBrandsRandomSkipNumber(n) {
  const x = Math.floor(Math.random() * (n - 4 + 1));
  await Wized.data.setVariable("featuredbrandsskipnumber", x);
  return x;
}

// Slickify the featured brands widget
async function featuredBrandsWidgetSlickify() {
  $(".discover__featured__brands-list").slick({
    responsive: [
      {
        breakpoint: 9999,
        arrows: false,
        dots: false,
        settings: 'unslick'
      },
      {
        breakpoint: 991,
        settings: {
          arrows: false,
          dots: false,
          infinite: true,
          speed: 300,
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 767,
        settings: {
          arrows: false,
          dots: false,
          infinite: true,
          speed: 300,
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  });
}
// Add the correct mask
async function addMasksToFeaturedBrandImages() {
  $(".discover__featured__brands-list .featured-brand:nth-child(1)").find(".img-mask-frame").addClass("mask--blob");
  $(".discover__featured__brands-list .featured-brand:nth-child(2)").find(".img-mask-frame").addClass("mask--diamond");
  $(".discover__featured__brands-list .featured-brand:nth-child(3)").find(".img-mask-frame").addClass("mask--blob");
  $(".discover__featured__brands-list .featured-brand:nth-child(4)").find(".img-mask-frame").addClass("mask--flower");
}

window.addEventListener("load", (event) => {
  if($(".discover-miigle__featured").attr("data-featured-brands-type") == "related") {
  } else {
    getFeaturedBrandsAndIds();
  }
});

