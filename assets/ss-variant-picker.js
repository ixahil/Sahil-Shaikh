if(!customElements.get("ss-variant-picker")){
    customElements.define("ss-variant-picker",
        class SSVariantPicker extends HTMLElement{
            constructor(){
                super();
                this.select = this.querySelector(".size-select");
                this.selectBox = this.select?.querySelector(".size-select__box");
                this.selectList = this.select?.querySelector(".size-select__list");
                this.vIdInput = document.querySelector(".quick-view-variant-id");
                
                this.variantData = JSON.parse(document.querySelector("[variant-data]").innerHTML);
                
                this.selectedOptions = {};
                
                this.inputs = this.querySelectorAll('input[type="radio"]');
            }

            get currentVariant(){
                return this.variantData.find((variant) => {
                    // Match variant options array with selectedOptions object
                    return Object.values(this.selectedOptions).every((value, index) => {
                        return variant.options[index] === value;
                    });
                });
            }

            connectedCallback(){
                if(this.selectBox){
                    this.selectBox.addEventListener("click", this.selectToggle.bind(this));
                }
                
                if(this.selectList){
                    this.selectList.querySelectorAll("li").forEach((item) => {
                        item.addEventListener("click", this.handleSizeSelect.bind(this));
                    });
                }
                
                this.inputs.forEach((input) => {
                    input.addEventListener("change", this.handleRadioSelect.bind(this));
                });
            }

            selectToggle(){
                this.select?.classList.toggle("open");
            }

            handleSizeSelect(event){
                const sizeValue = event.target.dataset.value;
                this.selectBox.querySelector(".size-select__selected").innerText = sizeValue;
                this.select.classList.add("selected");
                this.selectToggle();
                
                const fieldset = this.select.closest("fieldset");
                const optionName = fieldset.dataset.optionName;
                
                this.selectedOptions[optionName] = sizeValue;
                this.handleVariantChange();
            }

            handleRadioSelect(event){
                const input = event.target;
                
               
                const fieldset = input.closest("fieldset");
                const optionName = fieldset.dataset.optionName;
                
                this.selectedOptions[optionName] = input.value;
                this.handleVariantChange();
            }

            handleVariantChange(){
                const variant = this.currentVariant;

                console.log(variant);
                
                if(variant){
                    if(this.vIdInput){
                        this.vIdInput.value = variant.id;
                    }
                    
                    this.updateProductInfo(variant);
                    
                    this.dispatchEvent(new CustomEvent('variant-change', {
                        detail: { variant },
                        bubbles: true
                    }));
                }
            }

            updateProductInfo(variant){
                const salePriceElement = document.querySelector(".price__sale");
                if(salePriceElement){
                    salePriceElement.innerText = this.formatMoney(variant.price);
                }
                
                const comparePriceElement = document.querySelector(".price__regular");
                if(comparePriceElement){
                    if(variant.compare_at_price && variant.compare_at_price > variant.price){
                        comparePriceElement.innerText = this.formatMoney(variant.compare_at_price);
                        comparePriceElement.style.display = 'block';
                    } else {
                        comparePriceElement.style.display = 'none';
                    }
                }
                
                const addToCartButton = document.querySelector('button[name="add"][data-atc]');
                if(addToCartButton){
                    addToCartButton.disabled = !variant.available;
                    addToCartButton.innerText = variant.available ? "Add to cart" : "Sold out";
                }
                
                if(variant.featured_image){
                    const mainImage = document.querySelector(".quick-view-dialog__image img");
                    if(mainImage){
                        mainImage.src = variant.featured_image.src;
                    }
                }
            }

            formatMoney(cents){
                return `$${(cents / 100).toFixed(2)}`;
            }
        }
    );
}

document.addEventListener("DOMContentLoaded", (event) => {
    const atcButton = document.querySelector('button[name="add"][data-atc]');

    console.log(atcButton, "atcButton")
    
    if(atcButton){
        atcButton.addEventListener("click", (event) => {
            event.preventDefault();
            
            const button = event.target;
            const originalText = button.innerText;
            
            // loading state
            button.disabled = true;
            button.classList.add('loading');
            button.innerText = 'Adding...';
            
            const formData = {
                'items': [{
                    'id': document.querySelector(".quick-view-variant-id").value,
                    'quantity': 1
                }]
            };
            
            fetch('/cart/add.js', {
                method: 'POST',
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                console.log('Added to cart:', data);
                
                button.innerText = 'Added!';
                button.classList.remove('loading');
                button.classList.add('success');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.disabled = false;
                    button.innerText = originalText;
                    button.classList.remove('success');
                }, 2000);
                
                document.dispatchEvent(new CustomEvent('cart:updated'));
            })
            .then(error => {
                console.error('Error adding to cart:', error);
                
                // Error state
                button.disabled = false;
                button.innerText = 'Error - Try again';
                button.classList.remove('loading');
                button.classList.add('error');
                
                // Reset after 2 seconds
                setTimeout(() => {
                    button.innerText = originalText;
                    button.classList.remove('error');
                }, 2000);
            });
        });
    }
});