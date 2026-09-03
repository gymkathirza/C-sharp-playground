export type Lesson = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
};

export const LESSONS: Lesson[] = [
  {
    id: "hello-world",
    title: "Hello World",
    description: "Your first C# program using top-level statements.",
    starterCode: `// C# top-level statements (C# 9+)
using System;

Console.WriteLine("Hello, World!");
`,
  },
  {
    id: "variables-types",
    title: "Variables and Types",
    description: "Explore C# value types, reference types, and type inference.",
    starterCode: `using System;

// Value types
int age = 30;
double pi = 3.14159;
bool isActive = true;
char grade = 'A';

// Type inference with var
var name = "Alice";
var score = 42;

// Strings
string greeting = $"Hello, {name}! You are {age} years old.";
Console.WriteLine(greeting);
Console.WriteLine($"Pi ≈ {pi:F2}");
Console.WriteLine($"Grade: {grade}, Active: {isActive}");
`,
  },
  {
    id: "control-flow",
    title: "Control Flow",
    description: "if/else, switch expressions, for, foreach, and while loops.",
    starterCode: `using System;

int[] numbers = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };

// foreach
int sum = 0;
foreach (int n in numbers)
{
    sum += n;
}
Console.WriteLine($"Sum: {sum}");

// Pattern matching switch expression
for (int i = 1; i <= 5; i++)
{
    string label = i switch
    {
        1 => "one",
        2 => "two",
        3 => "three",
        _ => "many",
    };
    Console.WriteLine($"{i} = {label}");
}
`,
  },
  {
    id: "classes-objects",
    title: "Classes and Objects",
    description: "Define classes, properties, constructors, and methods.",
    starterCode: `using System;

public class Animal
{
    public string Name { get; }
    public string Sound { get; }

    public Animal(string name, string sound)
    {
        Name = name;
        Sound = sound;
    }

    public string Speak() => $"{Name} says {Sound}!";
}

var cat = new Animal("Cat", "meow");
var dog = new Animal("Dog", "woof");

Console.WriteLine(cat.Speak());
Console.WriteLine(dog.Speak());
`,
  },
  {
    id: "linq-basics",
    title: "LINQ Basics",
    description: "Query collections with Language Integrated Query (LINQ).",
    starterCode: `using System;
using System.Collections.Generic;
using System.Linq;

var fruits = new List<string> { "apple", "banana", "cherry", "date", "elderberry" };

// Where + Select
var longFruits = fruits
    .Where(f => f.Length > 5)
    .Select(f => f.ToUpperInvariant())
    .ToList();

Console.WriteLine("Long fruits:");
foreach (var f in longFruits)
    Console.WriteLine($"  {f}");

// Aggregate
int totalLength = fruits.Sum(f => f.Length);
Console.WriteLine($"Total length: {totalLength}");

// OrderBy + First
string first = fruits.OrderBy(f => f.Length).First();
Console.WriteLine($"Shortest: {first}");
`,
  },
];

export function findLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}
