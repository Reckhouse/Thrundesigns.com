// Keep the vendored Emscripten bindings compatible with a CSP without unsafe-eval.
// Re-run after updating public/basis/basis_transcoder.js, then browser-test decoding.
const fs = require('node:fs');
const file = 'public/basis/basis_transcoder.js';
let source = fs.readFileSync(file, 'utf8');
function replaceBetween(start, end, replacement) {
  const a = source.indexOf(start), b = source.indexOf(end, a);
  if (a < 0 || b < 0) throw new Error('Basis binding layout changed; review patch');
  source = source.slice(0, a) + replacement + source.slice(b);
}
replaceBetween('function craftInvokerFunction(', 'var __embind_register_class_constructor=', `
function craftInvokerFunction(humanName,argTypes,classType,cppInvokerFunc,cppTargetFunc,isAsync) {
  if(argTypes.length<2) throwBindingError('Invalid binding argument count');
  var isMethod=argTypes[1]!==null && classType!==null;
  var needsStack=usesDestructorStack(argTypes);
  return createNamedFunction(humanName,function(...args) {
    if(args.length!==argTypes.length-2) throwBindingError('function '+humanName+' called with '+args.length+' arguments, expected '+(argTypes.length-2));
    var destructors=needsStack?[]:null;
    var wired=[];
    if(isMethod) wired.push(argTypes[1].toWireType(destructors,this));
    for(var i=0;i<args.length;i++) wired.push(argTypes[i+2].toWireType(destructors,args[i]));
    var rv=cppInvokerFunc(cppTargetFunc,...wired);
    if(needsStack) runDestructors(destructors);
    else for(var i=isMethod?1:2;i<argTypes.length;i++) {
      if(argTypes[i].destructorFunction!==null) argTypes[i].destructorFunction(wired[i-(isMethod?1:2)]);
    }
    if(argTypes[0].name!=='void') return argTypes[0].fromWireType(rv);
  });
}
`);
replaceBetween('var __emval_get_method_caller=', 'var __emval_get_module_property=', `
var __emval_get_method_caller=(argCount,argTypes,kind)=>{
  var types=emval_lookupTypes(argCount,argTypes);
  var retType=types.shift();
  var invokerFunction=function(obj,func,destructorsRef,argsPointer) {
    var args=[], offset=0;
    for(var type of types) {
      args.push(type.readValueFromPointer(argsPointer+offset));
      offset+=type.argPackAdvance;
    }
    var rv=kind===1?Reflect.construct(func,args):func.apply(obj,args);
    if(!retType.isVoid) return emval_returnValue(retType,destructorsRef,rv);
  };
  return emval_addMethodCaller(createNamedFunction('methodCaller',invokerFunction));
};
`);
if(source.includes('newFunc(Function,')) throw new Error('Unpatched dynamic binding');
fs.writeFileSync(file, source);
