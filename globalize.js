
if( !document.querySelector('[data-jengine-mode=sandbox]') ) {

  fn.globalize();

  if( !this._ ) {
    this._ = this.$utils;
  }
}
