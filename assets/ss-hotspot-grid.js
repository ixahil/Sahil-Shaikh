 if (!customElements.get('hotspot-grid')) {
    customElements.define(
      'hotspot-grid',
      class HotspotGrid extends HTMLElement {
        constructor() {
          super();

          this.dialog = this.querySelector('dialog');
          this.btns = this.querySelectorAll('.hotspot-collection-grid__tracker');
          this.closeDialog = this.querySelector('.quick-view-dialog__close');
          this.loader = this.dialog.querySelector('.custom-loading__spinner');
          this.quickview = this.querySelector('.quick-view-dialog__content .quick-view');
          this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        }

        connectedCallback() {
          if(this.btns){
            this.btns.forEach((btn) => {
              btn.addEventListener('click', this.open.bind(this, btn));
            });
          }

          if(this.closeDialog){
            this.closeDialog.addEventListener('click', this.close.bind(this));
          }
          if(this.dialog){
            this.dialog.addEventListener("click", (event) => {
              if (event.target === this.dialog) {
                this.close();
              }
            });
          }

          this.quickview.addEventListener('click', this.handleATC.bind(this));
        }

        async open(btn) {
          this.dialog.showModal();
          await this.getMarkup(`/products/${btn.dataset.handle}?sections=ss-quick-view`);
          
        }

        close() {
          this.dialog.close();
          this.loader.style.display = 'flex';
          this.quickview.replaceChildren();
          this.quickview.replaceChildren();
        }

        async getMarkup(uri) {
          try {
            const res = await fetch(uri);
            if (!res.ok) this.handleError();

            const data = await res.json();

            const quickViewMarkup = data['ss-quick-view'];

            if (quickViewMarkup) {
              this.quickview.innerHTML = quickViewMarkup;
              this.loader.style.display = 'none';
            }
          } catch (e) {
            console.error('something wrong with quickview', e);
          }
        }

        handleError(e) {
          this.close();
          console.error('something wrong with quickview', e);
          throw e;
        }

        async handleATC(event) {
          const button = event.target.closest('button[name="add"][data-atc]');
          if (!button) return;

          event.preventDefault();

          const originalText = button.innerText;

          button.disabled = true;
          button.classList.add('loading');
          button.innerText = 'Adding...';

          const variantInput = this.quickview.querySelector(".quick-view-variant-id");
          if(!variantInput || !variantInput.value) throw new Error("something wrong")

          const formData = new FormData();
          formData.append('id', variantInput.value);
          formData.append('quantity', 1);

          try {
            const response = await fetch('/cart/add.js', {
              method: 'POST',
              body: formData
            });

            formData.append(
              'sections',
              this.cart.getSectionsToRender().map((section) => section.id)
            );
            formData.append('sections_url', window.location.pathname);

            if(!response.ok) throw new Error("Item not added");

            const data = await response.json();

            button.innerText = 'Added!';
            button.classList.remove('loading');
            button.classList.add('success');

            setTimeout(() => {
              button.disabled = false;
              button.innerText = originalText;
              button.classList.remove('success');
            }, 2000);

            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'product-form',
              productVariantId: variantInput.value,
              cartData: data,
            }).then(() => {
              console.log(this.cart);
            });
            this.cart.renderContents(data);


          } catch (error) {
            console.error('Error adding to cart:', error);

            button.disabled = false;
            button.innerText = 'Error - Try again';
            button.classList.remove('loading');
            button.classList.add('error');

            setTimeout(() => {
              button.innerText = originalText;
              button.classList.remove('error');
            }, 2000);
          }
        }
      }
    );
  }