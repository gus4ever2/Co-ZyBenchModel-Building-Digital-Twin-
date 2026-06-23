package com.example.cozybench.model.constructions;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import lombok.Getter;
import org.json.JSONObject;
import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

public class ComponentProperties extends Component {
    // Key: Enum with material properties
    // Value: String with the value of the property
    @Getter
    private ComponentPropertiesInterface componentPropertiesRecord;

    public ComponentProperties(int id, ComponentTypeEnumInterface materialTypeString, HashSet<String> names) throws InvocationTargetException, InstantiationException, IllegalAccessException, ClassNotFoundException {
        // It returns the type of the material as Enum
        super(id, materialTypeString, names);
        this.updateWithDefaultValues(names);
    }

    private Class<ComponentPropertiesInterface> selectClass() throws ClassNotFoundException {

        // It returns the name of the material's Record
        String componentRecordClassString = this.componentTypeEnum.getComponentClassString();
        // It returns the record of the material
        Class<ComponentPropertiesInterface> recordOfMaterialClass =
                (Class<ComponentPropertiesInterface>) Class.forName(componentRecordClassString);

        return recordOfMaterialClass;
    }

    public void updateWithDefaultValues(HashSet<String> names) throws InvocationTargetException, InstantiationException, IllegalAccessException, ClassNotFoundException {

        // It returns the class of the Record
        Class<ComponentPropertiesInterface> recordOfMaterialClass = this.selectClass();

        // It returns the constructor of the Record
        Constructor<ComponentPropertiesInterface> constructorOfTheMaterialsRecord = (Constructor<ComponentPropertiesInterface>) recordOfMaterialClass.getConstructors()[0];

        // It returns an Array with Enums that they are the properties of material's type
        ComponentPropertiesEnumInterface[] propertiesEnumsArray = this.componentTypeEnum.getPropertiesEnums();

        // It creates an Array with the default values from the enum properties Array
        String[] propertiesValuesArray = Arrays.stream(propertiesEnumsArray).sequential().map(ComponentPropertiesEnumInterface::getDefaultValue)
                .toArray(String[]::new);

        // Name is unique because it is the Key
        propertiesValuesArray[0] = super.updateName(propertiesValuesArray[0], names);

        // Creates an Instance of the Record with parameters the default values
        this.componentPropertiesRecord = constructorOfTheMaterialsRecord.newInstance(propertiesValuesArray);
    }

    public void updateWithDict(HashMap<String, String> newPropertiesDict, HashSet<String> names) throws ClassNotFoundException {
        Gson gson = new Gson();
        // Convert Dictionary with properties to JSON
        String newPropertiesJson = gson.toJson(newPropertiesDict);

        this.updateWithJson(newPropertiesJson, names);


        //return this;
    }

    // jsonRecord: It is a JSON with properties (Record),
    // not a ComponentPropertie's object.
    public void updateWithJson(String newPropertiesJson, HashSet<String> names) throws ClassNotFoundException {

        // It returns the class of the Record
        Class<ComponentPropertiesInterface> recordOfMaterialClass = this.selectClass();

        Gson gson = new Gson();

        if(validateJson(newPropertiesJson))
        {
            // Convert JSON to JSON object so I can change the Name
            JSONObject jsonHandler = new JSONObject(newPropertiesJson);

            // Read the name in JSON
            String nameInJson = jsonHandler.getString("Name");

            // It checks if the update updates the Name
            if (!nameInJson.equals(this.name)) {
                // It finds a valid Name
                super.updateName(nameInJson, names);
                // It removes the old Name
                jsonHandler.remove("Name");
                // It adds a new one
                jsonHandler.put("Name", this.name);
            }

            // It updates the current state
            componentPropertiesRecord = gson.fromJson(jsonHandler.toString(), recordOfMaterialClass);
        }

        //return this;
    }

    private boolean validateJson(String newPropertiesJson){

        // Convert JSON to JSON object
        JSONObject jsonHandler = new JSONObject(newPropertiesJson);

        // A set with every key
        Set<String> jsonKeys = jsonHandler.keySet();

        // It returns an Array with Enums that they are the properties of material's type
        ComponentPropertiesEnumInterface[] propertiesEnumsArray = this.componentTypeEnum.getPropertiesEnums();

        HashSet<String> propertyNamesSet = Arrays.stream(propertiesEnumsArray)
                .sequential()
                .map(ComponentPropertiesEnumInterface::getEppyName)
                .collect(HashSet::new,
                        HashSet::add,
                        HashSet::addAll);

        return jsonKeys.containsAll(propertyNamesSet);
    }

    @Override
    public String toString(){
        Gson gson = new GsonBuilder()
                .setPrettyPrinting()
                .create();
            return " Component Type: " + componentTypeEnum + "\n"
                    + gson.toJson(componentPropertiesRecord);
    }

}
