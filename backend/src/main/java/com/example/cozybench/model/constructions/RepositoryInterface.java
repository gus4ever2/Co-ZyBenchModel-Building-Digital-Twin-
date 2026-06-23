package com.example.cozybench.model.constructions;

import java.lang.reflect.InvocationTargetException;
import java.util.HashMap;
import java.util.Map;

public interface RepositoryInterface <I extends ComponentInterface> {
    int createComponent(ComponentTypeEnumInterface componentTypeEnum) throws ClassNotFoundException, InvocationTargetException, InstantiationException, IllegalAccessException;
    I selectComponent(int id);
    Map<Integer, I> selectAllComponents();
    void updateComponentWithDict(int id, HashMap<String, String> newPropertiesDict) throws ClassNotFoundException;
    void updateComponentWithJSON(int id, String newPropertiesJson) throws ClassNotFoundException;
    void deleteComponent(int id);
}
