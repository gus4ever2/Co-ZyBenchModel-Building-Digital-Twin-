package com.example.cozybench.model.factory;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;

import java.util.Map;

public interface FactoryInterface<T extends IdfObjectRecord> {
    Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties);
    Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name);
    TypeEnumInterface getType();

}

