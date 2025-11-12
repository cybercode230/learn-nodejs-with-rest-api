""" 
    Hero I'm CYUZUZO josue as softeware engineer, This is very excited moment to build python
    programming with collecting some questions given into DTP program whoo let's get into it......
"""

#TODO 1) print "hello,world" in the console by using print() statement.
print("Hello,World!")

#TODO 2) print your name and display some personality by allowing user to input his name value and be displayed

#valiable that will ask for the username in console
gave_name = input("Please enter you name: ")
#console statement of personal greetings
print(f"Hello,{gave_name} Welcome to the DTP program for software beinner.")
     

#TODO 3) To demostrate how variable and varues work in python

"""
    Variable: it's about computer memory that given a name and being assigned a values or be null
    for sometimes or a container that is going to be store values
    
    Values: it's all possible data that variable has like anything that will be kept into container
    
    Datatypes: is about the what kind of data that variable hold of store
"""
age = 25             # Integer
name = "Alice"       # String
height = 5.7         # Float
isAuthenticated = True  # Boolean

print(age, name, height, isAuthenticated)

#TODO 4) The different between Statement and expression

"""
    Expression : is all about the what process are we making that will produce value
    Statement : is and actions that is going to happen after we make expression like they're boing used
    to perform and action
"""
variable_1 = 1
variable_2 = 5
expression_sample = variable_1 + variable_2

# statement to show outpu to console
print(f"This is the statement that is being gaven to the expression => {expression_sample}")


#TODO 5) Explain what is REPL

"""
    REPL stands for (Read,Evaluate,Print,Loop) and it allows you to type a codes and see output immediately
"""
3+3 # as expression
name= "cybercode230" # assign statement
print(name)  # print states


#TODO 6) a Python program that converts a given temperature in Celsius to Fahrenheit using user inputs
"""
    This is the given formular to be used
    F = (C × 9/5) + 32
"""
# TO have variable that will store and receive the celsius from user inputs and it will accept the float input support
celsius = float(input("Enter you celsius number you want whether integer or float number: "))
# To apply the given folmular to make clear stateme lastly from the expression given
fahrenheit = (celsius * 9/5) + 32 
# Is to make a clean statemeent output the given expressions
print(f"{celsius}°C = {fahrenheit}°F")

#TODO 7) Create a program that asks the user for a sentence and prints:

# We need the variable to hold that inputed sentence from the user
make_sentence = input("Create you first sentence to DTP programm one with including the word Python: ")
# we need to count the lenght and characters of hte sentence
print("Number of characters:", len(make_sentence))
# we need to make the same sentence in UPPERCASE
print("Upper sentence", make_sentence.upper())
# we need to search te word Python once exist and it will return boolean statement
print("Containes 'Python' ?: ", "Python" in make_sentence)


#TODO 8) Use Boolean logic to decide if someone can go outside

# we need to have that condition
is_raining = True
have_umbrella = False
# we need to make condition statement that says if ther is a rain but no umberella you should start inside elfi go outside else not rain you're free
if is_raining and not have_umbrella:
    print("Better stay inside!")
elif is_raining and have_umbrella:
    print("You can go outside with your umbrella.")
else:
    print("No rain, enjoy your day!")
    
    
#TODO 9) Write a program that uses both numeric and string data types to calculate and print your age next year

# we will need two valiables the one to input you age and the one to make addition toward you have and add 1 for next year
age=int(input("Enter your current age: "))    
age_next_year = age + 1
print("Next year you will be " + str(age_next_year) + " years old!")


#TODO 10) Create a program that compares two numbers entered by the user and prints which one is greater or if they are equal

# we need to first have that two valiable that will store a given number
num_1 = int(input("Enter your first number: "))
num_2 = int(input("Enter your second number: "))

# we need to add camparison logic to which number is greater than other
if num_1 > num_2:
    print(f" The given number {num_1} is greater than {num_2}")
elif num_2 > num_1:
    print(f" The given number {num_2} is greater than {num_1}")
else:
    print("Both numbers are equal!!")
    
#TODO 11) Write a program that determines whether a number is even or odd and prints the result

# we need to capture the number from user
num=int(input("Enter an number you want for even and odd: ")) 

# we need to chacke if that is even or odd number
if num % 2 == 0:
    print(f"given number is even {num}")
else:
    print(f"given number is odd {num}")
    
#TODO 12) Ask the user for their age and print whether they are a child (<13), teenager (13–19), or adult (20+).    
    
# we need to capture the age from user
age=int(input("Enter your age here: "))
 
# validate the age to child, teenager, adult
if age < 13:
    print("Child")
elif 13 <= age <= 19:
    print("Teenager")
else:
    print("Adult")
    
#TODO 13) Write a grade evaluation program that asks for a score and prints:

# we need to ask the user score 
score = int(input("Enter your score: "))

if 80 <= score <= 100:
    print("Excellent")
elif 60 <= score < 80:
    print("Good")
else:
    print("Needs Improvement")
    
#TODO 14) Create a login simulation that asks for a username and password.

# we need to create the variables that will store teh custom creadentials
stored_use_name = "cyber"
stored_password = "123"

# we need ask use for creadentials
user_name= input("Enter your username: ")
password = input("Enter your password: ")

# conditional statement to chacke creadential and provide message
if user_name == stored_use_name and password == stored_password:
    print("Login successfully!!")
else:
    print("Acess denied!")
    
#TODO 15) Create a list of five fruits.Add one new fruit, remove one existing fruit, and print the final list.

# I need to have a fruits list
fruits =["apple","mango","banana","spices"]  
# add new fruit
fruits.append("orange")
# remove fruit
fruits.remove("apple")
# print final list
print(fruits)

#TODO 16) Use a tuple to store a student’s ID, name, and course.Print all values in a formatted sentence.

#i need to have that tuple
students =(1235780295892,"cybercode","machine learning and python programing")
# print all information
print(f"Student {students[1]} with ID {students[0]} is enrolled in {students[2]}.")

#TODO 17) Create a dictionary with student names as keys and their grades as values.

# we need to have that dictionary with student name and key and grade and value
Students_grades = {"Alice":30,"cyber":99,"DTP":100}
# Print all names of students who scored above 50.
for name,grade in Students_grades.items():
    if grade > 50:
        print(f" the following are list of above 50 marks {name}")
        
#TODO 18) Modify your dictionary by updating one student’s grade and deleting another entry.

# we need to acces the previouc dict to change the "cyber" grade to 40 updating
Students_grades["cyber"] = 40
#deleting the values
del Students_grades["Alice"]
# Print the updated dictionary.    
print(Students_grades)

#TODO 19) Create two sets of numbers (e.g., {1, 2, 3, 4} and {3, 4, 5, 6}) and display:

#set A
set_a = {1,2,3,4}
set_b = {3,4,5,6}

# print all outputs
print("Union", set_a | set_b)
print("intersection", set_a & set_b)
print("Difference", set_a - set_b)


#TODO 20) Write a for loop that prints all numbers from 1 to 10 on separate lines

for numbers in range(1,11):
    print(numbers)

#TODO 21) Write a while loop that keeps asking the user to enter a number and stops only when they type "0".

# while loop unit we reach to type "0"
while True:    
    # we need to ask that number a user repeatedly until we reach to 0
    type_num = int(input("Enter a number (0 to stop): "))
    if type_num == 0:
        break
    
#TODO 22) Use list comprehension to generate a list of even numbers between 1 and 30, and print it  

# create list
even_list = [x for x in range(1,31) if x % 2 == 0] 
print("This is the generated even list ",even_list)

#TODO 23) Create a dictionary with three people’s names as keys and their ages as values

ages = {"John": 25, "Alice": 30, "Bob": 20}
for name, age in ages.items():    
    print(f"{name} is {age} years old.")
    
#TODO 24) Write a nested loop that prints a multiplication table from 1 to 5.

for i in range(1,6):
    for j in range(1,6):
        print(f"{i} x {j} = {i*j}")
    # Blank line after each row
    print()