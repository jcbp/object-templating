describe('object-templating', function() {
	var ObjectTemplating = require('../src/object-templating.js');

	var objA = {
		title: 'the title',
		items: [
			{
				name: 'item 1'
			},
			{
				name: 'item 2'
			},
			{
				name: 'item 3'
			}
		]
	};
	var total = objA.items.length;

	it('copies a simple array', function() {
		var a = ObjectTemplating.create(objA, {
			'elements': 'items'
		});
		expect(a.elements).toEqual(jasmine.any(Array));
		expect(a.elements.length).toEqual(total);
	});
	it('copies an array of objects', function() {
		var a = ObjectTemplating.create(objA, {
			'elements[].text': 'items[].name'
		});
		expect(a.elements).toEqual(jasmine.any(Array));
		expect(a.elements.length).toEqual(total);
	});
	it('copies an array with different object levels', function() {
		var a = ObjectTemplating.create(objA, {
			'elements[].child.text': 'items[].name'
		});
		expect(a.elements[0].child.text).toEqual('item 1');
		expect(a.elements[1].child.text).toEqual('item 2');
		expect(a.elements[2].child.text).toEqual('item 3');
	});
	it('copies a property', function() {
		var a = ObjectTemplating.create(objA, {
			'property': 'title'
		});
		expect(a.property).toEqual('the title');
	});
	it('copies into multi level property', function() {
		var a = ObjectTemplating.create(objA, {
			'child.property.text': 'title'
		});
		expect(a.child.property.text).toEqual('the title');
	});
	it('iterates the array on the destination object', function() {
		var a = ObjectTemplating.create(objA, {
			'elements': 'items',
			'elements[].prop.title': 'title'
		});
		expect(a.elements.length).toEqual(total);
		expect(a.elements[0].prop.title).toEqual('the title');
		expect(a.elements[1].prop.title).toEqual('the title');
		expect(a.elements[2].prop.title).toEqual('the title');
	});
});