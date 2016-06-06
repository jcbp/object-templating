# ObjectTemplating
Converts an object to another according to a structure defined by a template

## Usage

```
var output = ObjectTemplating.create(data, template);
```

* `data`: it's an object with the data to convert (origin data source)
* `template`: it's an object where each key is a destination path and its value is the corresponging source path

## Defining a template

### Attribute assignment `"."`

Use the dot character `"."` to define an object as a child of another.
The attribute is denoted by the following to the last dot.

Example:
```
{
	"general.title": "bookstore.name"
}
```

### Collection assignment `"[]"`

Use brackets `"[]"` to define a collection.
If the brackets are present in both the origin and destination, it will iterate over the origin
collection. This means that the destination will have the same length as the origin.

Example:
```
{
	"books[].author": "bookstore.items[].author"
}
```

If the brackets are only present in the destination, it will iterate over the destination collection
and it assigns the same value on each item. For this option is necessary a previous assignment that creates
the destination collection.

Example:
```
{
	"books[].author": "bookstore.items[].author",
	"books[].available": ">true"
}
```

### Literal value assignment `">"`

Use character `">"` to define a literal value on the origin.
This value will be cast to one of the following data types:
* boolean: if it's equal to true or false
* array: if it's between brackets
* number: if it's only numbers
* string: if it doesn't match any of the foregoing

Example:
```
{
	"general.floorNumber": ">3",
	"books[].author": "bookstore.comedy.items[].author",
	"books[].genre": ">comedy",
	"books[].available": ">true"
}
```

### Using a helper

A helper is a function that will be called after resolving the source path value,
which can make changes on the value before it is assingned to the destination.
Instead of a source path string, you can pass an object that contains an attribute "path"
and another attribute "helper".
A helper should be previously defined by using `ObjectTemplating.registerHelper(name, helper)`.

Example:
```
{
	"books[].author": {path: "bookstore.items[].author", helper: "capitalize"}
}
```

## Complete example

### Data

```
var bookstoreData = {
	"category": "literature",
	"items": [
		{
			"name": "El Aleph",
			"info": {
				"author": "Jorge Luis Borges",
				"genre": "fantasy"
			}
		},
		{
			"name": "It",
			"info": {
				"author": "Stephen King",
				"genre": "horror"
			}
		},
		{
			"name": "The Exorcist",
			"info": {
				"author": "William Peter Blatty",
				"genre": "horror",
				"year": "1971"
			}
		},
		{
			"name": "The Hitchhiker's Guide to the Galaxy",
			"info": {
				"author": "Douglas Adam",
				"genre": "comedy"
			}
		},
		{
			"name": "Is Everyone Hanging Out Without Me?",
			"info": {
				"author": "Mindy Kaling",
				"genre": "comedy"
			}
		}
	]
};
```

### Helper

```
ObjectTemplating.registerHelper("capitalize", function(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
});
```

### Template

```
var template = {
	"bookstore.name": ">Ateneo",
	"bookstore.books[].name": "items[].name",
	"bookstore.books[].author": "items[].info.author",
	"bookstore.books[].genre": {path: "items[].info.genre", helper: "capitalize"},
	"bookstore.books[].optional.year": "items[].info.year",
	"bookstore.books[].category": "category"
};
```

### Creating an new object from the template

```
var output = ObjectTemplating.create(bookstoreData, template);
```

### Output

```
{
	"bookstore": {
		"name": "Ateneo",
		"books": [
			{
				"name": "El Aleph",
				"author": "Jorge Luis Borges",
				"genre": "Fantasy",
				"optional": {
					"year": null
				},
				"category": "literature"
			},
			{
				"name": "It",
				"author": "Stephen King",
				"genre": "Horror",
				"optional": {
					"year": null
				},
				"category": "literature"
			},
			{
				"name": "The Exorcist",
				"author": "William Peter Blatty",
				"genre": "Horror",
				"optional": {
					"year": "1971"
				},
				"category": "literature"
			},
			{
				"name": "The Hitchhiker's Guide to the Galaxy",
				"author": "Douglas Adam",
				"genre": "Comedy",
				"optional": {
					"year": null
				},
				"category": "literature"
			},
			{
				"name": "Is Everyone Hanging Out Without Me?",
				"author": "Mindy Kaling",
				"genre": "Comedy",
				"optional": {
					"year": null
				},
				"category": "literature"
			}
		]
	}
}
```
