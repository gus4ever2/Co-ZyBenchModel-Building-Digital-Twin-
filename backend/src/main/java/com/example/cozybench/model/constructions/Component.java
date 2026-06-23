package com.example.cozybench.model.constructions;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Getter;
import org.json.JSONObject;
import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.HashSet;

public abstract class Component {
    @Getter
    protected int id;
    // Type of the material
    @Getter
    protected final ComponentTypeEnumInterface componentTypeEnum;
    // key of the part
    @Getter
    protected String name;
    // A set to keep track all the names of the materials because they should be unique
    protected static HashSet<String> names = null;

    public Component(int id, ComponentTypeEnumInterface componentTypeEnum, HashSet<String> names) {
        this.componentTypeEnum = componentTypeEnum;
        // A set to keep track all the names of the materials because they should be unique
        Component.names = names;
        this.id = id;
    }

    protected String updateName(String newName, HashSet<String> names) {
        // It finds a unique name adding 1 in every existing name
        this.name = findValidName(newName, names);
        // It adds the valid name to the set
        // because name is Key and it should be unique
        addNameToSet(this.name, this.names);

        return this.name;
    }

    private String findValidName(String newName, HashSet<String> names){
        int i = 1;
        String validName = newName;
        while (isExist(validName, names)){
            validName = newName + " (" + i + ")";
            i++;
        }
        return validName;
    }

    public void updateWithDefaultValues(HashSet<String> names) throws InvocationTargetException, InstantiationException, IllegalAccessException, ClassNotFoundException {
        this.name = this.updateName(name, Component.names);
    }

    public void updateWithDict(HashMap<String, String> newPropertiesDict, HashSet<String> names) throws ClassNotFoundException {

        // Validation
        if (newPropertiesDict.containsKey("Name")) {
            String newName = newPropertiesDict.get("Name");
            this.name = this.updateName(newName, Component.names);
        }

    }

    public void updateWithJson(String newPropertiesJson, HashSet<String> names) throws ClassNotFoundException {

        // Convert JSON to JSON object so I can change the Name
        JSONObject jsonHandler = new JSONObject(newPropertiesJson);

        // Validation
        if (jsonHandler.keySet().contains("Name")){
            // Read the name in JSON
            String nameInJson = jsonHandler.getString("Name");
            Component.names = names;
            this.name = this.updateName(nameInJson, Component.names);
        }

    }

    private void addNameToSet(String newName, HashSet<String> names){
        names.add(newName);
    }

    private boolean isExist(String name, HashSet<String> names){
        return (names).contains(name);
    }
}
