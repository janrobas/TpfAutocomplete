/*! Select2 4.0.2 | https://github.com/select2/select2/blob/master/LICENSE.md */


function stevnost(n, st1, st2, st3, st5) {
  if(n % 100 == 1) {
    return st1;
  }

  if(n % 100 == 2) {
    return st2;
  }

  if(n % 100 == 3 || n % 100 == 4) {
    return st3;
  }

  return st5;
}

(function(){if(jQuery&&jQuery.fn&&jQuery.fn.select2&&jQuery.fn.select2.amd)var e=jQuery.fn.select2.amd;return e.define("select2/i18n/si",[],function(){return{errorLoading:function(){return"Ne morem naložiti rezultatov."},inputTooLong:function(e){var t=e.input.length-e.maximum,n="Prosimo, izbrišite "+t+" znakov";return t!=1&&(n+="s"),n},inputTooShort:function(e){var t=e.minimum-e.input.length,n="Vnesite "+t+" ali več znakov";return n},loadingMore:function(){return"Nalagam več rezultatov…"},maximumSelected:function(e){var t="Izberete lahko največ "+e.maximum+" " + stevnost(e.maximum, "element", "elementa", "elemente", "elementov");return t},noResults:function(){return"Ni najdenih rezultatov"},searching:function(){return"Iskanje…"}}}),{define:e.define,require:e.require}})();
