if (!customElements.get('hotspot-grid')) {
  customElements.define(
    'hotspot-grid',
    class HotspotGrid extends HTMLElement {
      constructor() {
        super();

        this.dialog = this.querySelector('dialog');
        this.btns = this.querySelectorAll('.hotspot-collection-grid__tracker');
        this.closeBtn = this.querySelector('.quick-view-dialog__close');
        this.loader = this.querySelector('.custom-loading__spinner');
        this.quickview = this.querySelector('.quick-view');
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.upsellVariantId = "63513792643441";
        this.upsellColors = ["Black"]
        this.upsellSizes = ["Medium", "M"]
      }


      connectedCallback() {
        this.btns?.forEach((btn) =>
          btn.addEventListener('click', () => this.open(btn))
        );

        this.closeBtn?.addEventListener('click', () => this.close());

        this.dialog?.addEventListener('click', (e) => {
          if (e.target === this.dialog) this.close();
        });

        this.quickview?.addEventListener('click', (e) =>
          this.handleATC(e)
        );
      }

      async open(btn) {
        if (!this.dialog) return;

        this.dialog.showModal();
        this.loader?.classList.remove('hidden');

        await this.getMarkup(
          `/products/${btn.dataset.handle}?sections=ss-quick-view`
        );
      }

      close() {
        this.dialog?.close();
        this.loader?.classList.remove('hidden');
        this.quickview?.replaceChildren();
      }

      async getMarkup(uri) {
        try {
          const res = await fetch(uri);
          if (!res.ok) throw new Error('Quickview fetch failed');

          const data = await res.json();
          const markup = data['ss-quick-view'];

          if (markup && this.quickview) {
            this.quickview.innerHTML = markup;
            this.loader?.classList.add('hidden');
          }
        } catch (e) {
          console.error('Quickview error:', e);
          this.close();
        }
      }

      async handleATC(event) {
        const button = event.target.closest(
          'button[name="add"][data-atc]'
        );
        if (!button) return;

        event.preventDefault();

        const variantInput = this.quickview?.querySelector('.quick-view-variant-id');

        if (!variantInput?.value) {
          console.error('Variant ID missing');
          return;
        }

        const originalText = button.innerText;

        button.disabled = true;
        button.classList.add('loading');
        button.innerText = 'Adding...';

        const itemsToAdd = [
          {
            id: variantInput.value,
            quantity: 1
          }
        ];

        this.variantPicker = this.querySelector("ss-variant-picker");
        const normalize = (v) => v?.toLowerCase().trim(); // Normalize so Black or black should match

        let selectedOptions = this.variantPicker?.currentVariant; // selected options ["", ""]

        selectedOptions = selectedOptions?.options?.map(normalize) || [];

        const hasColorMatch = options.some(opt => this.upsellColors.includes(opt));

        const hasSizeMatch = options.some(opt => this.upsellSizes.includes(opt));

        const shouldUpsell = hasColorMatch && hasSizeMatch;
        
        if (shouldUpsell) {
          items.push({
            id: this.upsellVariantId,
            quantity: 1,
            properties: {
              "_upsell-product": variantInput.value,
              "_upsell-location": "Quick View"
            }
          });
        }

        const payload = {
          items: itemsToAdd
        };

        if (this.cart) {
          payload.sections = this.cart.getSectionsToRender().map((s) => s.id).join(',');
          payload.sections_url = window.location.pathname;
        }

        try {
          const response = await fetch('/cart/add.js', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
              'Content-Type': 'application/json'
            },
          });

          if (!response.ok) throw new Error('Add to cart failed');

          const data = await response.json();

          button.innerText = 'Added!';
          button.classList.remove('loading');
          button.classList.add('success');

          // Cart update
          if (this.cart && data?.sections) {
            publish(PUB_SUB_EVENTS.cartUpdate, {
              source: 'hotspot-grid',
              productVariantId: variantInput.value,
              cartData: data,
            });

            this.cart.renderContents(data);
          } else {
            console.warn('Cart or sections missing');
          }

        } catch (error) {
          console.error('ATC Error:', error);

          button.innerText = 'Error';
          button.classList.remove('loading');
          button.classList.add('error');
        } finally {
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          setTimeout(() => {
            button.disabled = false;
            button.innerText = originalText;
            button.classList.remove('success', 'error');
          }, 2000);
          CartPerformance.measureFromEvent("add:user-action", event);

        }
      }
    }
  );
}