const dependable = require('dependable');
const path = require('path');

const container = dependable.container();

const simpleDependencies = [
    ['_', 'lodash'], //array
    ['passport', 'passport']
];

simpleDependencies.forEach(function(val){
    container.register(val[0], function(){
        return require(val[1]);
    })
})

container.load(path.join(__dirname, '/controllers')); //every function create in this file can be used to other file without export
container.load(path.join(__dirname, '/helpers'));

container.register('container', function (){
    return container;
});

module.exports = container;

