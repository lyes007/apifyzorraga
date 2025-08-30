import json

def extract_level1_categories():
    """
    Extract all level 1 category names from the automotive parts JSON file.
    """
    # Read the JSON file
    with open('categories.json', 'r', encoding='utf-8') as file:
        data = json.load(file)
    
    # Extract level 1 categories
    level1_categories = []
    
    # The JSON structure has categories as top-level keys
    for category_name, category_data in data.items():
        if isinstance(category_data, dict) and category_data.get('level') == 1:
            level1_categories.append(category_name)
    
    # Sort categories alphabetically for better readability
    level1_categories.sort()
    
    # Print results
    print("Level 1 Categories Found:")
    print("=" * 50)
    for i, category in enumerate(level1_categories, 1):
        print(f"{i:2d}. {category}")
    
    print(f"\nTotal Level 1 Categories: {len(level1_categories)}")
    
    # Also save to a text file
    with open('level1_categories.txt', 'w', encoding='utf-8') as output_file:
        output_file.write("Level 1 Categories:\n")
        output_file.write("=" * 50 + "\n")
        for i, category in enumerate(level1_categories, 1):
            output_file.write(f"{i:2d}. {category}\n")
        output_file.write(f"\nTotal: {len(level1_categories)} categories")
    
    print(f"\nResults also saved to 'level1_categories.txt'")
    
    return level1_categories

if __name__ == "__main__":
    categories = extract_level1_categories()
