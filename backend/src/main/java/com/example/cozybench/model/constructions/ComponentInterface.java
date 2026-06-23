package com.example.cozybench.model.constructions;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.HashSet;

public interface ComponentInterface {
    int getId();
    String getName();
    ComponentPropertiesInterface getComponentPropertiesRecord();
    ComponentTypeEnumInterface getComponentTypeEnum();
    void updateWithDefaultValues(HashSet<String> names) throws InvocationTargetException, InstantiationException, IllegalAccessException, ClassNotFoundException;
    void updateWithDict(HashMap<String, String> newPropertiesDict, HashSet<String> names) throws ClassNotFoundException;
    void updateWithJson(String newPropertiesJson, HashSet<String> names) throws ClassNotFoundException;
}
