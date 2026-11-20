from functions import test_functions

#Test if functions work
print(test_functions())

SENTINEL = "q"
choice = input("Select an option: ")
while choice.lower() != SENTINEL:
    # print some menu/list of choices
    choice = input("Select an option: ")
    
# DISCLAIMER: densities, yield/ultimate-strengths are averaged for simplicity (strengths measured in MPa)
#             data is sourced & averaged from matweb & amesweb : https://www.matweb.com/index.aspx, https://amesweb.info/Materials/Aluminum-Yield-Tensile-Strength.aspx
