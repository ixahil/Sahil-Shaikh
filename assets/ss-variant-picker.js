if(!customElements.get("ss-variant-picker")){
    customElements.define("ss-variant-picker",
        class SSVariantPicker extends HTMLElement{
            constructor(){
                super();
                this.select = this.querySelector(".size-select");
                this.selectBox = this.select.querySelector(".size-select__box");
                this.selectList = this.select.querySelector(".size-select__list");
            }

            connectedCallback(){
                this.selectBox.addEventListener("click", this.selectToggle.bind(this));
                this.selectList.querySelector("li").addEventListener("click", this.handleSelect.bind(this));
            }


            selectToggle(){
                if(this.select.classList.contains("open")){
                    this.select.classList.remove("open");
                }
                else{
                    this.select.classList.add("open");
                }
            }

            handleSelect(event){
                console.log(event.target);
            }


        })
}