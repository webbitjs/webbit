var __defProp=Object.defineProperty,__defProps=Object.defineProperties,__getOwnPropDescs=Object.getOwnPropertyDescriptors,__getOwnPropSymbols=Object.getOwnPropertySymbols,__hasOwnProp=Object.prototype.hasOwnProperty,__propIsEnum=Object.prototype.propertyIsEnumerable,__defNormalProp=(e,t,r)=>t in e?__defProp(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r,__spreadValues=(e,t)=>{for(var r in t||(t={}))__hasOwnProp.call(t,r)&&__defNormalProp(e,r,t[r]);if(__getOwnPropSymbols)for(var r of __getOwnPropSymbols(t))__propIsEnum.call(t,r)&&__defNormalProp(e,r,t[r]);return e},__spreadProps=(e,t)=>__defProps(e,__getOwnPropDescs(t));!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):(e="undefined"!=typeof globalThis?globalThis:e||self).webbit=t()}(this,(function(){"use strict";const e=new RegExp("^[a-z]+(([0-9])|([A-Z0-9][a-z0-9]+))*([A-Z])?$"),t=new RegExp("^([a-z][a-z0-9]*)(-[a-z0-9]+)*$"),r=new RegExp("^(String|Boolean|Number|Array|Object)$"),s=e=>e instanceof Object&&null!==e&&"Source"===e.constructor.__WEBBIT_CLASSNAME__,n=(e,t)=>{if(e===t)return!0;if(typeof e!=typeof t)return!1;if(e instanceof Array&&t instanceof Array){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}return!1},o=e=>!1===e?e:((e,r)=>{if("string"!=typeof e||!t.test(e))throw new Error(`The ${r} must be a string written in kebab case.`);return e})(e,"property's attribute"),i=t=>((t,r)=>{if("string"!=typeof t||!e.test(t))throw new Error(`The ${r} must be a string written in camel case.`);return t})(t,"property's name"),u=e=>"string"==typeof e?e:"",c=e=>((e,t)=>{if("string"!=typeof name||!r.test(e))throw new Error((e=>`The ${e} must be a string with value 'String', 'Number', 'Boolean', 'Array' or 'Object'.`)(t));return e})(e,"property's type"),a=(e,t)=>{const r=void 0===t?(e=>({String:"",Number:0,Boolean:!1,Array:[],Object:{}}[e]))(e):t;if(!((e,t)=>{switch(e){case"String":return"string"==typeof t;case"Number":return"number"==typeof t;case"Boolean":return"boolean"==typeof t;case"Array":return t instanceof Array;case"Object":return t instanceof Object}return!1})(e,r))throw new Error("The property's default value does not match its type.");return r},l=(e,t)=>{if(!1===e)return e;if("string"!=typeof e)throw new Error(t);return e},p=e=>l(e,"changeEvent must be false or a string"),h=({description:e="",defaultSourceKey:t=!1,defaultSourceProvider:r=!1,properties:s={},events:n=[],slots:h=[],cssProperties:f=[],cssParts:d=[]}={})=>{return{description:u(e),defaultSourceKey:(y=t,l(y,"defaultSourceKey must be false or a string")),defaultSourceProvider:(b=r,l(b,"defaultSourceProvider must be false or a string")),properties:Object.fromEntries(Object.entries(s).map((([e,t])=>((e,{description:t="",type:r="String",defaultValue:s,attribute:n=!1,reflect:l=!1,primary:h=!1,changeEvent:f=!1}={})=>{const d=c(r),b=a(d,s);return[i(e),{description:u(t),type:d,defaultValue:b,attribute:o(n),reflect:!!l,primary:!!h,changeEvent:p(f)}]})(e,t)))),events:n,slots:h,cssProperties:f,cssParts:d};var b,y};class f{static prop2PropValue(e){if(null===e)return null;if(e instanceof Array)return e;if("string"==typeof e)try{const t=JSON.parse(e);return t instanceof Array?t:[]}catch(t){return[]}return[]}static prop2AttrValue(e){const t=f.prop2PropValue(e);return null===t?null:JSON.stringify(t)}static attr2PropValue(e){if(null===e)return null;try{const t=JSON.parse(e);return t instanceof Array?t:[]}catch(t){return[]}}}class d{static prop2PropValue(e){if(null===e)return null;if(e instanceof Object)return e;if("string"==typeof e)try{const t=JSON.parse(e);return t instanceof Object?t:{}}catch(t){return{}}return{}}static prop2AttrValue(e){const t=d.prop2PropValue(e);return null===t?null:JSON.stringify(t)}static attr2PropValue(e){if(null===e)return null;try{const t=JSON.parse(e);return t instanceof Object?t:{}}catch(t){return{}}}}const b={Array:f,Boolean:class{static prop2PropValue(e){return null===e?null:!!e}static prop2AttrValue(e){return e?"":null}static attr2PropValue(e){return null!==e}},Number:class{static prop2PropValue(e){return null===e?null:parseFloat(e)}static prop2AttrValue(e){return null===e?null:parseFloat(e)}static attr2PropValue(e,t){return null===e?null:parseFloat(e)}},Object:d,String:class{static prop2PropValue(e){return null===e?null:(null==e?void 0:e.toString())||""}static prop2AttrValue(e){return null===e?null:(null==e?void 0:e.toString())||""}static attr2PropValue(e,t){return null===e?null:e}}},y=(e,t)=>b[t].prop2PropValue(e),_=(e,t)=>b[t].attr2PropValue(e);class g{get value(){const{reflect:e,attribute:t,name:r,type:s}=this._property;return t&&e?_(this._element.getAttribute(t),s):r in this._element?this._element[r]:_(this._element.getAttribute(t),s)}set value(e){const{attribute:t,name:r,type:s}=this._property,o=(e=>"string"==typeof e?"String":"number"==typeof e?"Number":"boolean"==typeof e?"Boolean":e instanceof Array?"Array":e instanceof Object?"Object":null)(e),i=this.value;if(!n(y(i,o),e))if(t){const r=((e,t)=>b[t].prop2AttrValue(e))(e,s),i=_(r,o);n(e,i)&&(null===r?this._element.removeAttribute(t):this._element.setAttribute(t,r))}else{const t=y(e,s),i=y(t,o);n(e,i)&&(this._element[r]=t)}}constructor(e,t){this._element=e,this._property=t,this._connected=!1,this._defaultValue=this._property.defaultValue,this._subscribers=[],this._propertyObserver=this._getPropertyObserver()}_getPropertyObserver(){const{changeEvent:e,attribute:t}=this._property;if(e){const t=()=>{this._notifySubscribers()};return{connect:()=>{this._element.addEventListener(e,t,!1)},disconnect:()=>{this._element.removeEventListener(e,t,!1)}}}if(t){const e=new MutationObserver((()=>{this._notifySubscribers()}));return{connect:()=>{e.observe(this._element,{attributes:!0,attributeFilter:[t]})},disconnect:()=>{e.disconnect()}}}return{connect(){},disconnect(){}}}connect(){if(!this._connected){const e=this.value;this._defaultValue=void 0!==e?e:this._property.defaultValue,this._propertyObserver.connect(),this._connected=!0}}disconnect(){this._connected&&(this._connected=!1,this._propertyObserver.disconnect(),this._setToDefault())}update(e){this.connect(),this.value=e}subscribe(e){this._subscribers.push(e)}_notifySubscribers(){const e=this.value;this._subscribers.forEach((t=>{t(e)}))}_setToDefault(){this.value=this._defaultValue}}return class{get sourceProvider(){return this.element.getAttribute("source-provider")}get sourceKey(){return this.element.getAttribute("source-key")}set sourceProvider(e){e&&this.element.setAttribute("source-provider",e)}set sourceKey(e){e&&this.element.setAttribute("source-key",e)}get source(){return this.store.getSource(this.sourceProvider,this.sourceKey)}get hasSource(){return void 0!==this.store.getRawSource(this.sourceProvider,this.sourceKey)}constructor(e,t,r){this.element=e,this.store=t,this.config=h(r||{name:e.tagName.toLowerCase()});const s=Object.entries(this.config.properties).map((([e,t])=>__spreadProps(__spreadValues({},t),{name:e})));this.propertyHandlers=new Map(s.map((e=>{const t=new g(this.element,e);return t.subscribe((t=>{this._onPropertyUpdate(e,t)})),[e.name,t]}))),this.primaryPropertyConfig=s.find((({primary:e})=>e)),this.primaryPropertyHandler=this.primaryPropertyConfig?this.propertyHandlers.get(this.primaryPropertyConfig.name):null,this._connected=!1,this._sourceChangeObserver=this._getSourceChangeObserver(),this.defaultPropertyValues={},this._unsubscribe=()=>{},this.store.defaultSourceProviderSet((e=>{null===this.sourceProvider&&(this.sourceProvider=e)})),this.connect()}_getSourceChangeObserver(){const e=new MutationObserver((()=>{this._updateSubscription()}));return{connect:()=>{e.observe(this.element,{attributes:!0,attributeFilter:["source-provider","source-key"]})},disconnect:()=>{e.disconnect()}}}connect(){this._connected=!0,this._sourceChangeObserver.connect(),this._updateSubscription()}disconnect(){this._connected=!1,this._sourceChangeObserver.disconnect(),this._updateSubscription()}_updateSubscription(){if(!this._connected)return this._unsubscribe(),this._unsubscribe=()=>{},void this.propertyHandlers.forEach((e=>e.disconnect()));this.sourceKey||(this.sourceKey=this.config.defaultSourceKey),this.sourceProvider||(this.sourceProvider=this.config.defaultSourceProvider||this.store.getDefaultSourceProvider()),this.sourceKey&&this.sourceProvider?(this._unsubscribe(),this.propertyHandlers.forEach((e=>{e.disconnect()})),this._unsubscribe=this.store.subscribe(this.sourceProvider,this.sourceKey,((e,t,r)=>{this._subscriber(e,t,r)}),!0)):(this._unsubscribe(),this._unsubscribe=()=>{},this.propertyHandlers.forEach((e=>e.disconnect())))}_subscriber(e,t,r){if(void 0===e)this.propertyHandlers.forEach((e=>{e.disconnect()}));else if(s(e))if(t===r)Object.getOwnPropertyNames(e).forEach((t=>{this.propertyHandlers.has(t)&&this.propertyHandlers.get(t).update(e[t])}));else{const s=r.replace(t+"/","");if(this.propertyHandlers.has(s)){const t=this.propertyHandlers.get(s),r=e[s];void 0===r?t.disconnect():t.update(r)}}else this.primaryPropertyHandler&&this.primaryPropertyHandler.update(e)}_onPropertyUpdate({name:e,primary:t},r){const o=this.source;if(s(o))n(o[e],r)||(o[e]=r);else if(t&&!n(o,r)){this.store.getSourceProvider(this.sourceProvider).userUpdate(this.sourceKey,r)}}}}));