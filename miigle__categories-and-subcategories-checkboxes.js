$( document ).ready(function() {
    try {
      const parentCategoriesPromise = Wized.request.execute("Get all categories");
      const allSubcategoriesResponsePromise = Wized.request.execute("Get all subcategories");

      Promise.all([parentCategoriesPromise, allSubcategoriesResponsePromise])
        .then(async ([parentCategoriesResponse, allSubcategoriesResponse]) => {
          const parentCategories = parentCategoriesResponse.data;
          const allSubcategoriesResponseArray = allSubcategoriesResponse.data.data.items;

          checkForSubcategoriesOnPage(submitNestSubcategoriesInCategories);

          setTimeout(async () => {
            await handleCheckboxChangesAsync();
          }, 5000);
          
        })
        .catch(error => {
          console.log(error);
        });

    } catch (error) {
      console.log(error);
    }
});
  
  
  // Move sub-category checkboxes inside parent category wrappers
  async function submitNestSubcategoriesInCategories(callback) {
    //console.log("Running submitNestSubcategoriesInCategories function");
    const subcategoryWrappers = document.querySelectorAll(".submit__form__categories__subcat__single");
    const categoryWrappers = document.querySelectorAll('.submit__form__categories__single');
  
    subcategoryWrappers.forEach(subcategoryWrapper => {
      const parentCategoryId = subcategoryWrapper.getAttribute('parentcategoryid');
  
      categoryWrappers.forEach(categoryWrapper => {
        if (categoryWrapper.getAttribute('parentcategoryid') === parentCategoryId) {
          categoryWrapper.appendChild(subcategoryWrapper);
        }
      });
    });
  }
  async function loadingComplete() {
    $(".submit-form__loader").hide();
    $("body").removeClass("loading");
    await populateMmbFormWithCategories();
  }
  async function handleCheckboxChangesAsync() {
    // Get all the checkboxes
    $(".submit-form__loader--cat").hide();
    //console.log("setting up checkbox handler");
    const checkboxes = document.querySelectorAll('.submit__form__category-button input[type="checkbox"]');
  
    // Attach a change event listener to each checkbox
    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });
  
    // Handle checkbox change event
    function handleCheckboxChange(event) {
      const checkbox = event.target;
  
      // Get the parentcategoryid from the parent div
      const parentDiv = checkbox.closest('.submit__form__category-button');
      const parentcategoryid = parentDiv.getAttribute('parentcategoryid');
  
      // Find the corresponding element with parentcategoryid equal to parentcategoryid
      const categoryElement = document.querySelector(`.submit__form__categories__single[parentcategoryid="${parentcategoryid}"]`);
  
  
      // Check if the checkbox is checked
      if (checkbox.checked) {
        // Add the "show" class to the categoryElement
        categoryElement.classList.add('show');
      } else {
        // Remove the "show" class from the categoryElement
        categoryElement.classList.remove('show');
  
        // Uncheck all input checkboxes within categoryElement
        const inputCheckboxes = categoryElement.querySelectorAll('input[type="checkbox"]');
        inputCheckboxes.forEach((inputCheckbox) => {
          inputCheckbox.checked = false;
        });
      }
    }
  }

  async function checkForSubcategoriesOnPage(callback) {
    if ($(".submit__form__categories__subcat__single").length > 1) {
      callback();
      loadingComplete();
    } else {
      setTimeout(function() {
        if ($(".submit__form__categories__subcat__single").length > 1) {
          callback();
          loadingComplete();
        }
      }, 1000);
    }
  }

$(document).ready(function() {
  // Categories field array builder
    $("body").on("change", "div[submit-brand-block='categories'] .submit__form__category-button__inner input",function (e) {
        categoriesCount = $("div[submit-brand-block='categories'] .submit__form__category-button__inner").find("input:checked").length;
        if (categoriesCount == 0) {
            $("#categories-array").val("");
            $("#searchableCategories").val("");
        }
        categoriesArray = [];
        searchableCategoriesArray = [];
        $("div[submit-brand-block='categories'] .submit__form__category-button__inner").find("input:checked").each(function() {
            var categoryContentfulId = $(this).parents(".submit__form__category-button").attr("parentcategoryid");
            var categoryName = $(this).siblings(".category-checkbox__name").text();
            var categoriesSingleObj = {
                "sys": {
                    "type": "Link",
                    "linkType": "Entry",
                    "id": categoryContentfulId
                }
            }
            categoriesArray.push(categoriesSingleObj);
            searchableCategoriesArray.push(categoryName);
            var categoriesJSON = JSON.stringify(categoriesArray);
            $("#categories-array").val(categoriesJSON);
            $("#searchableCategories").val(searchableCategoriesArray);
        });
            $("div[submit-brand-block='categories']").find("input").parents(".submit__form__category-button__inner").removeClass("selected");
            $("div[submit-brand-block='categories']").find("input:checked").parents(".submit__form__category-button__inner").addClass("selected");
        });


        // Sub categories field array builder
        $("body").on("change", ".submit__form__categories__subcat__single input",function (e) {
        subcategoriesCount = $(".submit__form__categories__subcat__single").find("input:checked").length;
        if (subcategoriesCount == 0) {
            $("#subcategories-array").val("");
        }
        subcategoriesArray = [];
        $(".submit__form__categories__subcat__single").find("input:checked").each(function() {
            var subcategoryContentfulId = $(this).parents(".submit__form__categories__subcat__single").attr("subcategoryid");
            var subcategoriesSingleObj = {
                "sys": {
                    "type": "Link",
                    "linkType": "Entry",
                    "id": subcategoryContentfulId
                }
            }
            subcategoriesArray.push(subcategoriesSingleObj);
            var subcategoriesJSON = JSON.stringify(subcategoriesArray);
            $("#subcategories-array").val(subcategoriesJSON);
        });
        $("div[submit-brand-block='categories']").find("input").parents(".submit__form__categories__subcat__single").removeClass("selected");
        $("div[submit-brand-block='categories']").find("input:checked").parents(".submit__form__categories__subcat__single").addClass("selected");
    });
});

async function populateMmbFormWithCategories() {
    const url = window.location.href;
    // if (url.includes('/brand/')) {
      // Loop through all ".mmb-single-brand__category-wrapper" elements
      const mmbCategoryWrappers = document.querySelectorAll('.single-brand__category-wrapper');
  
      mmbCategoryWrappers.forEach(wrapper => {
        // Get the mmb-parentcategoryid attribute
        const mmbParentCategoryId = wrapper.getAttribute('parentcategoryid');
  
        // Get all ".mmb-submit__form__category-button" elements
        const mmbCategoryButtons = document.querySelectorAll('.submit__form__category-button');
  
        // Loop through each category button
        mmbCategoryButtons.forEach(button => {
          // Get the .mmb-submit__form__category-button__inner element inside the button
          const buttonInner = button.querySelector('.submit__form__category-button__inner');
  
          // Check if the mmb-parentcategoryid attribute matches
          if (button.getAttribute('parentcategoryid') === mmbParentCategoryId) {
            // Add the "selected" class to the .mmb-submit__form__category-button__inner element
            buttonInner.classList.add('selected');
  
            // Find the parent ".submit__form__categories__single" and add class "show"
            const categorySingle = button.closest('.submit__form__categories__single');
            if (categorySingle) {
              categorySingle.classList.add('show');
            }
          }
        });
      });
  
      // Loop through all ".mmb-single-brand__subcategory-wrapper" elements
      const mmbSubcategoryWrappers = document.querySelectorAll('.single-brand__subcategory-wrapper');
  
      mmbSubcategoryWrappers.forEach(wrapper => {
        // Get the mmb-subcategoryid attribute
        const mmbSubcategoryId = wrapper.getAttribute('subcategoryid');
  
        // Get all ".mmb-submit__form__categories__subcat__single" elements
        const mmbSubcategoryElements = document.querySelectorAll('.submit__form__categories__subcat__single');
  
        // Loop through each subcategory element
        mmbSubcategoryElements.forEach(element => {
          // Check if the mmb-subcategoryid attribute matches
          if (element.getAttribute('subcategoryid') === mmbSubcategoryId) {
            // Add the "selected" class to the relevant subcategory element
            element.classList.add('selected');
  
            // Find the parent ".submit__form__categories__single" and add class "show"
            const subcategorySingle = element.closest('.submit__form__categories__single');
            if (subcategorySingle) {
              subcategorySingle.classList.add('show');
            }
          }
        });
      });
    // }
  }

  