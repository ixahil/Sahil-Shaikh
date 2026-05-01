if(!customElements.get("ss-variant-picker")){
    customElements.define("ss-variant-picker",
        class SSVariantPicker extends HTMLElement{
            constructor(){
                super();
                this.selectBox = this.querySelector(".size-select__box");
                this.selectList = this.selectBox.querySelector(".size-select__list");
            }

            connectedCallback(){
                this.selectBox.addEventListener("click", this.selectToggle.bind(this))
            }


            selectToggle(){
                if(this.selectList.classList.contains("open")){
                    this.querySelector(".size-select__list").classList.remove("open");
                }
                else{
                    this.querySelector(".size-select__list").classList.add("open");
                }
            }


        })
}