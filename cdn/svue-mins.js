class SVue {
    constructor(options) {
        this.$options=options,this.$data=options.data,this.observe(this.$data),new Compile(options.el,this),options.created&&options.created.call(this);
    }
    observe(obj) {
        if (!obj || typeof obj !== 'object') {
            return;
        }
        Object.keys(obj).forEach(e=>{"object"!=typeof obj[e]&&(this.defineReactive(obj,e,obj[e]),this.proxyData(e))});
    }
    defineReactive(obj, key, val) {
        this.observe(val);const dep=new Dep;Object.defineProperty(obj,key,{get:()=>(Dep.target&&dep.addDep(Dep.target),val),set(e){e!==val&&(val=e,dep.notify())}});
    }
    proxyData(key) {
        Object.defineProperty(this,key,{get(){return this.$data[key]},set(e){this.$data[key]=e}});
    }

}
class Dep {
    constructor() {
        this.deps = [];
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        this.deps.forEach(dep => dep.updata())
    }

}
class Watcher {
    constructor(vm, key, cb) {
        this.vm=vm,this.key=key,this.cb=cb,Dep.target=this,this.vm[this.key],Dep.target=null;
    }
    updata() {
        this.cb.call(this.vm, this.vm[this.key])
    }
}
class Compile {
    constructor(el, vm) {
        this.$el=document.querySelector(el),this.$vm=vm,this.$el&&(this.$fragment=this.node2Fragment(this.$el),this.compile(this.$fragment),this.$el.appendChild(this.$fragment));
    }
    node2Fragment(el) {
        const frag=document.createDocumentFragment();let child;for(;child=el.firstChild;)frag.appendChild(child);
        return frag;
    }
    compile(el) {
        const childNodes=el.childNodes;Array.from(childNodes).forEach(i=>{if(this.isElement(i)){const s=i.attributes;Array.from(s).forEach(s=>{const t=s.name,e=s.value;if(this.isDirective(t)){const s=t.substring(2);this[s]&&this[s](i,this.$vm,e)}if(this.isEvent(t)){let s=t.substring(1);this.eventHandler(i,this.$vm,e,s)}})}else this.isInterpolation(i)&&this.compileText(i);i.childNodes&&i.childNodes.length>0&&this.compile(i)});
    }
    isDirective(attr) {
        return attr.indexOf('s-') == 0;
    }
    isEvent(attr) {
        return attr.indexOf('@') == 0;
    }
    isElement(node) {
        return node.nodeType === 1;
    }
    isInterpolation(node) {
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
    }
    compileText(node) {
        this.updata(node, this.$vm, RegExp.$1, 'text');
    }
    updata(node, vm, exp, dir) {
        const updaterFn=this[dir+"Updater"];updaterFn&&updaterFn(node,vm[exp]),new Watcher(vm,exp,function(e){updaterFn&&updaterFn(node,e)});
    }
    textUpdater(node, value) {
        node.textContent = value;
    }
    text(node, vm, exp) {
        this.updata(node, vm, exp, 'text');
    }  
    eventHandler(node, vm, exp, dir) {
        let fn=vm.$options.methods&&vm.$options.methods[exp];dir&&fn&&node.addEventListener(dir,fn.bind(vm),!1);
    }
    model(node, vm, exp) {
        this.updata(node,vm,exp,"model");let val=vm.exp;node.addEventListener("input",e=>{let t=e.target.value;vm[exp]=t,val=t});
    }
    modelUpdater(node, value) {
        node.value = value;
    }
    html(node, vm, exp) {
        this.updata(node, vm, exp, 'html');
    }
    for(node, vm, exp){
        const params = exp.split('|') || [];
        if(params.length<1){
            return
        }
        const data = vm.$data[params[0]] 
        let newArr = '';
        data.forEach((item)=>{
            newArr = newArr+ `<${node.nodeName}>${item[params[1]]}</${node.nodeName}>`
        })
        node.parentNode.innerHTML = newArr;
    }
    htmlUpdater(node, value) {
        node.innerHTML = value;
    }
    
}