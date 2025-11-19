"""
    Hero I'm CYUZUZO Josue, a software engineer. 
    This is an exciting moment to continue building Python skills 
    with another set of practical questions from the DTP program.
    Let's get into it...🔥
"""

# TODO 1) Receive three inputs: string, integer, float. Print type() & convert to strings inside a list.

user_string = input("Enter a string: ")
user_int = int(input("Enter an integer: "))
user_float = float(input("Enter a float: "))

print(type(user_string), type(user_int), type(user_float))

converted_list = [str(user_string), str(user_int), str(user_float)]
print("Converted list:", converted_list)


# TODO 2) Fix bug and explain x * y
x = "25"
y = 5
# Incorrect output because string * int repeats the string.
# Fix by converting x to integer.
print(int(x) * y)


# TODO 3) Convert Celsius into Kelvin & Fahrenheit, print data types.

celsius = float(input("Enter temperature in Celsius: "))
kelvin = celsius + 273.15
fahrenheit = (celsius * 9/5) + 32

print(kelvin, type(kelvin))
print(fahrenheit, type(fahrenheit))


# TODO 4) Swap two variables using multiple assignment.

a = 10
b = 20
a, b = b, a
print(a, b)


# TODO 5) Create a, b, c on one line; update them on another line.

a, b, c = 1, 2, 3
a, b, c = a+1, b+2, c+3
print(a, b, c)


# TODO 6) Unpack list values into variables.

data = ["Python", 3.12, True, 500]
lang, version, status, amount = data
print(lang, version, status, amount)


# TODO 7) Convert user age string → int with validation via isdigit().

age = input("Enter your age: ")

if age.isdigit():
    age = int(age)
    print("Age is valid:", age)
else:
    print("Invalid age! Must be a number.")


# TODO 8) Convert list of strings into integers using list comprehension.

nums = ["1", "2", "10", "25"]
converted_nums = [int(n) for n in nums]
print(converted_nums)


# TODO 9) Convert mixed list items into strings.

items = [True, 55, 3.14, "hello"]
string_items = [str(i) for i in items]
print(string_items)


# TODO 10) Ask user for 5 values, store, then print first, last, and full list.

values = []
for i in range(5):
    values.append(input(f"Enter value {i+1}: "))

print("First:", values[0])
print("Last:", values[-1])
print("All:", values)


# TODO 11) List numbers 1–50 and print even ones.

nums_50 = list(range(1, 51))
even_nums = [n for n in nums_50 if n % 2 == 0]
print(even_nums)


# TODO 12) Generate 10 random integers (1–100).

import random
random_list = [random.randint(1, 100) for _ in range(10)]
print(random_list)


# TODO 13) Modify fruits list.

fruits = ["apple", "banana", "mango"]
fruits.append("orange")
fruits.insert(1, "kiwi")
fruits[fruits.index("banana")] = "grapes"
fruits.remove("mango")
print(fruits)


# TODO 14) Remove duplicates WITHOUT using set().

dup_list = [1, 2, 2, 3, 4, 4, 5]
clean_list = []
for item in dup_list:
    if item not in clean_list:
        clean_list.append(item)

print(clean_list)


# TODO 15) Convert list of names to uppercase.

names = ["josue", "john", "mary"]
upper_names = [n.upper() for n in names]
print(upper_names)


# TODO 16) Sort list alphabetically then reverse, case-insensitive.

words = ["python", "Java", "ruby", "C++", "Go"]
words.sort(key=str.lower)
print(words[::-1])


# TODO 17) Sort list of dictionaries by age.

users = [{"name": "A", "age": 30}, {"name": "B", "age": 22}, {"name": "C", "age": 27}]
users_sorted = sorted(users, key=lambda x: x["age"])
print(users_sorted)


# TODO 18) Sort list descending WITHOUT reverse().

nums = [10, 4, 2, 50, 3]
desc_nums = sorted(nums, key=lambda x: -x)
print(desc_nums)


# TODO 19) Slicing ranges.

nums = list(range(1, 21))
print("First 5:", nums[:5])
print("Last 5:", nums[-5:])
print("Even positions:", nums[1::2])
print("Reversed:", nums[::-1])


# TODO 20) Extract middle items (300, 400)

data = [100, 200, 300, 400, 500]
print(data[2:4])


# TODO 21) Join slices into a word "Python"

letters = ["P", "y", "t", "h", "o", "n"]
word = "".join(letters[:])
print(word)


# TODO 22) Multiples of 3, multiples of 5, divisible by both.

nums = list(range(1, 31))
mul3 = [n for n in nums if n % 3 == 0]
mul5 = [n for n in nums if n % 5 == 0]
both = [n for n in nums if n % 3 == 0 and n % 5 == 0]

print(mul3, mul5, both)


# TODO 23) Split sentence and print various slices.

sentence = input("Enter a sentence: ")
words = sentence.split()

print("First 3:", words[:3])
print("Last 2:", words[-2:])
print("Reversed:", words[::-1])


# TODO 24) Convert CSV-style string into list of lists.

csv = "John,25,Engineer;Mary,30,Doctor;Sam,22,Designer"
final_list = [item.split(",") for item in csv.split(";")]
print(final_list)


# TODO 25) Create list, append 1–20, remove odd numbers, sort desc, slice top 3.

nums = []
for i in range(1, 21):
    nums.append(i)

nums = [n for n in nums if n % 2 == 0]  # remove odd
nums = sorted(nums, reverse=True)      # sort descending
print("Top 3:", nums[:3])
