package com.example.cozybench.model.factory;

import com.example.cozybench.model.TypeEnumInterface;
import com.example.cozybench.model.validationRecords.IdfObjectRecord;
import lombok.Getter;

import java.util.Map;

public abstract class AbstractFactory<T extends IdfObjectRecord> implements FactoryInterface<T> {
    @Getter
    private final TypeEnumInterface type;

    protected AbstractFactory(TypeEnumInterface type) {
        this.type = type;
    }

    protected Double toDouble(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return Double.valueOf(value);
    }

    protected Integer toInteger(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.valueOf(value.toString());
    }

    public abstract Map<IdfObjectRecord, TypeEnumInterface> createFromProperties(Map<String, String> properties);

    public abstract Map<IdfObjectRecord, TypeEnumInterface> createDefault(String name);
}
