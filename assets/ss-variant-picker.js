if(!customElements.get("ss-variant-picker")){
    customElements.define("ss-variant-picker",
        class SSVariantPicker extends HTMLElement{
            constructor(){
                super();
                this.selectBox = this.querySelector(".size-select__box");
                
            }

            connectedCallback(){
                this.selectBox.addEventListener("click", this.openSelect.bind(this))
            }


            openSelect(){
                this.querySelector(".size-select__list").style.display = "block";
            }


        })
}