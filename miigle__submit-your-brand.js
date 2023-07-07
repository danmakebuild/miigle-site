$( document ).ready(function() {
  prepareSubmitForm();
  const targetMarketResponse = Wized.request.execute("Get all target markets");
  checkTargetMarketButtonLength();
  Webflow.push(function() {
    addCountries('#country-selector');
  });
});


async function prepareSubmitForm() {
  try {
    $(".submit-form__loader").css("display","flex");
    $(".submit-form__loader--cat").css("display","flex");

  
    $("*[js-plan-selector='freemium']").click(function(){
        $(".submit-form__package__field:nth-child(1)").click();
    });
    $("*[js-plan-selector='featured']").click(function(){
        $(".submit-form__package__field:nth-child(2)").click();
    });
    $("*[js-plan-selector='ultimate']").click(function(){
        $(".submit-form__package__field:nth-child(3)").click();
    });
    
    // Customise the expedite Stripe payment link URL based on customer's email address
    $(".submit__form__main #Email-3").keyup(function() {
      let emailEncoded = encodeURIComponent($(this).val());
      let expeditedUrl = "https://buy.stripe.com/dR6aEO6yydQSe1G9AA?prefilled_email=" + emailEncoded;
      $("#button--expedite").attr("href",expeditedUrl);
    });
    
    $("#expedite-close").click(function() {
      $(".expedite").addClass("display-none");
    });
    } catch (error) {
      console.log(error);
  }
}

function checkTargetMarketButtonLength() {
  if ($(".submit__form__targetmarket-button").length > 1) {
    prepareTargetMarketArrayBuilder();
  } else {
    setTimeout(checkTargetMarketButtonLength, 500); // Check again after 0.5 seconds
  }
}


async function prepareTargetMarketArrayBuilder() {

    // Get the checkboxes nested inside ".submit__form__targetmarket-button" elements
    const targetCheckboxes = document.querySelectorAll('.submit__form__targetmarket-button input[type="checkbox"]');
    const targetMarketsArrayInput = document.getElementById('targetMarkets-Array');

    // Array to store the selected targetmarket items
    let selectedTargetMarketItems = [];

    // Function to handle checkbox change event
    function handleCheckboxChange(event) {
      const checkbox = event.target;
      const parentLabel = checkbox.parentElement;
      const parentDiv = checkbox.closest('.submit__form__targetmarket-button');
      const targetmarketid = parentDiv.getAttribute('targetmarketid');

      if (checkbox.checked) {
        // Add 'selected' class to the parent label element if checkbox is checked
        parentLabel.classList.add('selected');
        // Add item with targetmarketid to the selected targetmarket items array
        selectedTargetMarketItems.push({
          sys: {
            type: 'Link',
            linkType: 'Entry',
            id: targetmarketid
          }
        });
      } else {
        // Remove 'selected' class from the parent label element if checkbox is unchecked
        parentLabel.classList.remove('selected');
        // Remove item with targetmarketid from the selected targetmarket items array
        selectedTargetMarketItems = selectedTargetMarketItems.filter(
          item => item.sys.id !== targetmarketid
        );
      }

      // Update the targetMarkets-Array input field value with the updated selected targetmarket items array
      targetMarketsArrayInput.value = selectedTargetMarketItems.length === 0 ? '' : JSON.stringify(selectedTargetMarketItems);
    }

    // Add event listener to each checkbox
    targetCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', handleCheckboxChange);
    });

}



