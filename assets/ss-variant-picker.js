if (!customElements.get("ss-variant-picker")) {
  customElements.define(
    "ss-variant-picker",
    class SSVariantPicker extends HTMLElement {
      constructor() {
        super();

        this.select = this.querySelector(".size-select");
        this.selectBox = this.select?.querySelector(".size-select__box");
        this.selectList = this.select?.querySelector(".size-select__list");

        this.vIdInput = this.querySelector(".quick-view-variant-id");

        this.variantData = JSON.parse(
          this.querySelector("[variant-data]").innerHTML
        );

        this.fieldsets = [
          ...this.querySelectorAll("fieldset[data-option-name]")
        ];

        this.selectedOptions = {};

        this.inputs = this.querySelectorAll('input[type="radio"]');

        this.optionNames = this.fieldsets.map(
          (fs) => fs.dataset.optionName
        );

        console.log("Variant Data >>", this.variantData);
      }

      get currentVariant() {
        console.log("selected options", this.selectedOptions);

        // must have all options selected
        const isComplete = this.optionNames.every(
          (name) => this.selectedOptions[name] != null
        );

        if (!isComplete) return null;

        return this.variantData.find((variant) => {
          return this.optionNames.every((name, index) => {
            return variant.options[index] === this.selectedOptions[name];
          });
        });
      }

      connectedCallback() {
        this.syncInitialState();

        this.selectBox?.addEventListener("click",this.selectToggle.bind(this));

        this.selectList?.querySelectorAll("li").forEach((item) => {item.addEventListener("click", this.handleSizeSelect.bind(this));});

        this.inputs.forEach((input) => {input.addEventListener("change",this.handleRadioSelect.bind(this));});
      }


      syncInitialState() {
        this.fieldsets.forEach((fieldset) => {
          const optionName = fieldset.dataset.optionName;

          const checked = fieldset.querySelector('input[type="radio"]:checked');

          if (checked) {this.selectedOptions[optionName] = checked.value;}

          const selectedText = fieldset.querySelector(".size-select__selected");

          if (selectedText?.innerText.trim()) {this.selectedOptions[optionName] =selectedText.innerText.trim();}
        });

        console.log("Initial selectedOptions:", this.selectedOptions);
      }


      selectToggle() {
        this.select?.classList.toggle("open");
      }

      handleRadioSelect(event) {
        const input = event.target;
        const fieldset = input.closest("fieldset");
        const optionName = fieldset.dataset.optionName;

        this.selectedOptions[optionName] = input.value;

        this.handleVariantChange();
      }

      handleSizeSelect(event) {
        const sizeValue = event.target.dataset.value;

        this.selectBox.querySelector(".size-select__selected").innerText = sizeValue;

        this.select.classList.add("selected");
        this.selectToggle();

        const fieldset = this.select.closest("fieldset");
        const optionName = fieldset.dataset.optionName;

        this.selectedOptions[optionName] = sizeValue;

        this.handleVariantChange();
      }

      handleVariantChange() {
        const variant = this.currentVariant;

        console.log("selected variant >>", variant);

        if (!variant) return;

        if (this.vIdInput) {
          this.vIdInput.value = variant.id;
        }

        this.updateProductInfo(variant);

        this.dispatchEvent(
          new CustomEvent("variant-change", {
            detail: { variant },
            bubbles: true
          })
        );
      }

      updateProductInfo(variant) {
        const salePriceElement = document.querySelector(".price__sale");

        if (salePriceElement) {
          salePriceElement.innerText = this.formatMoney(variant.price);
        }

        const comparePriceElement = document.querySelector(".price__regular");

        if (comparePriceElement) {
          if (variant.compare_at_price && variant.compare_at_price > variant.price) {
            comparePriceElement.innerText = this.formatMoney(variant.compare_at_price);
            comparePriceElement.style.display = "block";
          } else {
            comparePriceElement.style.display = "none";
          }
        }

        const addToCartButton = document.querySelector('button[name="add"][data-atc]');

        if (addToCartButton) {
          addToCartButton.disabled = !variant.available;
          addToCartButton.innerText = variant.available
            ? "Add to cart"
            : "Sold out";
        }

        if (variant.featured_image) {
          const mainImage = document.querySelector(".quick-view-dialog__image img");

          if (mainImage) {
            mainImage.src = variant.featured_image.src;
          }
        }
      }

        // UTIL
      formatMoney(cents) {
        return `$${(cents / 100).toFixed(2)}`;
      }
    }
  );
}