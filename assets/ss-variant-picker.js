if(!customElements.get("ss-variant-picker")){
    customElements.define("ss-variant-picker",
        class SSVariantPicker extends HTMLElement{
            constructor(){
                super();
                this.select = this.querySelector(".size-select");
                this.selectBox = this.select(".size-select__box");
                this.selectList = this.select(".size-select__list");
            }

            connectedCallback(){
                this.selectBox.addEventListener("click", this.selectToggle.bind(this));
                console.log("this.selectList", this.selectList);
            }


            selectToggle(){
                if(this.select.classList.contains("open")){
                    this.select.classList.remove("open");
                }
                else{
                    this.select.classList.add("open");
                }
            }


        })
}