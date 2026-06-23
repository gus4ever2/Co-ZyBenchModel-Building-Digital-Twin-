package com.example.cozybench.model.constructions;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;

public abstract class ComponentRepository <I extends ComponentInterface> implements RepositoryInterface <I> {
    protected final ArrayList<I> componentsArrayList = new ArrayList<>();
    protected final static HashSet<String> names = new HashSet<>();
    protected static int idCounter = 0;

    protected ComponentRepository(){}

    public int createComponent(ComponentTypeEnumInterface componentTypeEnum) throws ClassNotFoundException, InvocationTargetException, InstantiationException, IllegalAccessException {

        int currentId = incrementId();

        // This is the constructor of the selected material
        Constructor<I> componentConstructor = this.selectComponentConstructor(componentTypeEnum);

        // It returns a component's object
        I component = componentConstructor.newInstance(currentId, componentTypeEnum, names);

        // It adds the component to Repository
        this.componentsArrayList.add(component);

        return currentId;
    }

    public I selectComponent(int _id){
        return componentsArrayList.stream().filter(component -> component.getId() ==  _id).findFirst().orElse(null);
    }

    public Map<Integer, I> selectAllComponents(){
        return componentsArrayList.stream().collect(Collectors.toMap(
                ComponentInterface::getId,
                component -> component
        ));
    }

    public void updateComponentWithDict(int id, HashMap<String, String> newPropertiesDict) throws ClassNotFoundException {
        this.selectComponent(id).updateWithDict(newPropertiesDict,  names);
    }

    public void updateComponentWithJSON(int id, String newPropertiesJson) throws ClassNotFoundException {
        this.selectComponent(id).updateWithJson(newPropertiesJson, names);
    }

    public void deleteComponent(int id){
        this.componentsArrayList.remove(this.selectComponent(id));
    }

    private int incrementId(){
        return ++idCounter;
    }

    private Constructor<I> selectComponentConstructor(ComponentTypeEnumInterface componentTypeEnum) throws ClassNotFoundException {

        // It returns the name of the material's Record
        String componentClassString = componentTypeEnum.getTypeClassString();

        // It returns the record of the material
        Class<I> componentsClass = (Class<I>) Class.forName(componentClassString);

        // It returns the constructor of the Record
        return  (Constructor<I>) componentsClass.getConstructors()[0];
    }
}
