#!/bin/bash
# Script to fix navigator -> navigation in React Native files

echo "Starting navigation fix script..."

# List of all files to check and fix
find ./app/screens -name "*.jsx" -type f | while read file; do
  echo "Processing $file..."
  
  # Check if the file uses expo-router navigation
  if grep -q "import { useNavigation } from 'expo-router'" "$file"; then
    echo "  Fixing expo-router import in $file"
    sed -i "s/import { useNavigation } from 'expo-router'/import { useNavigation } from '@react-navigation\/native'/" "$file"
  fi
  
  # Check if file has navigator variable
  if grep -q "const navigator = useNavigation()" "$file"; then
    echo "  Fixing navigator variable in $file"
    sed -i "s/const navigator = useNavigation()/const navigation = useNavigation()/" "$file"
  fi
  
  # Check and fix suffixAction with navigator.goBack
  if grep -q "suffixAction={() => navigator.goBack()}" "$file"; then
    echo "  Fixing navigator.goBack in suffixAction in $file"
    sed -i "s/suffixAction={() => navigator.goBack()}/suffixAction={() => navigation.goBack()}/" "$file"
  fi
  
  # Check and fix other direct navigator.goBack calls
  if grep -q "onPress={() => navigator.goBack()}" "$file"; then
    echo "  Fixing navigator.goBack in onPress in $file"
    sed -i "s/onPress={() => navigator.goBack()}/onPress={() => navigation.goBack()}/" "$file"
  fi
  
  # Fix navigator.navigate calls
  if grep -q "navigator.navigate" "$file"; then
    echo "  Fixing navigator.navigate calls in $file"
    sed -i "s/navigator.navigate/navigation.navigate/g" "$file"
  fi
  
  # Fix props passing - from navigator to navigation
  if grep -q "navigator={navigator}" "$file"; then
    echo "  Fixing navigator props in $file"
    sed -i "s/navigator={navigator}/navigation={navigation}/g" "$file"
  fi
  
  # Fix function params that use navigator
  if grep -q "({ .*, navigator" "$file"; then
    echo "  Fixing function parameters using navigator in $file"
    sed -i "s/({ \(.*\), navigator/({ \1, navigation/g" "$file"
  fi
done

echo "Done processing files. Please check the changes before committing." 