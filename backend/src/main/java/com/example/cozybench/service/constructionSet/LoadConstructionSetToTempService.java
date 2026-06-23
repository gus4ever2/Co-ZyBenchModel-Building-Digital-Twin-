package com.example.cozybench.service.constructionSet;

import com.example.cozybench.document.*;
import com.example.cozybench.repository.constructionSet.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LoadConstructionSetToTempService {

    private ConstructionSetDocument constructionSetDocument;
    private List<ConstructionDocument> constructionsDocumentsList;
    private List<MaterialDocument> materialDocumentList;
    private final ConstructionSetRepository constructionSetRepository;
    private final ConstructionRepository constructionRepository;
    private final MaterialRepository materialRepository;
    private final TempRepository tempRepository;

    private String userEmail;



    public void loadConstructionSet(String userEmail, String constructionSetName){
        this.userEmail = userEmail;
        this.findConstructionSet(constructionSetName);
        this.findConstructions();
        this.findMaterials();
        this.saveToTempRepository();
    }

    // It saves the Construction Set to Repository
    private void saveToTempRepository(){
        this.tempRepository.deleteByUserEmail(this.userEmail);
        this.tempRepository.save(this.toTempDocument(this.constructionSetDocument));
        this.tempRepository.saveAll(this.listToTempDocument(this.constructionsDocumentsList));
        this.tempRepository.saveAll(this.listToTempDocument(this.materialDocumentList));
    }

    private List<String> getMaterialNamesFromConstructions(
            List<ConstructionDocument> constructionDocumentsList
    ) {

        return constructionDocumentsList.stream()
                .map(this::extractMaterialNamesFromConstruction)
                .flatMap(List::stream)
                .distinct()
                .toList();
    }

    private List<String> extractMaterialNamesFromConstruction(
            ConstructionDocument constructionDocument
    ) {

        List<String> layerKeys = List.of(
                "Outside_Layer",
                "Layer_2",
                "Layer_3",
                "Layer_4",
                "Layer_5",
                "Layer_6",
                "Layer_7",
                "Layer_8",
                "Layer_9",
                "Layer_10"
        );

        return layerKeys.stream()
                .map(layerKey -> constructionDocument.getProperties().get(layerKey))
                .filter(Objects::nonNull)
                .map(Object::toString)
                .filter(materialName -> !materialName.isBlank())
                .toList();
    }

    private List<TempDocument> listToTempDocument(
            List<? extends BaseConstructionsDocument> componentDocuments
    ){
        return componentDocuments.stream()
                .map(this::toTempDocument)
                .toList();
    }

    private TempDocument toTempDocument(
            BaseConstructionsDocument componentDocument
    ) {
        return TempDocument.builder()
                .id(null)
                .userEmail(this.userEmail)
                .type(componentDocument.getType())
                .name(componentDocument.getName())
                .properties(
                        this.filterBlankFields(componentDocument.getProperties())
                )
                .build();
    }

    private LinkedHashMap<String, String> filterBlankFields(LinkedHashMap<String, String> properties){
        return properties.entrySet()
                .stream()
                .filter(entry -> entry.getValue() == null || !entry.getValue().isBlank())
                .collect(
                        LinkedHashMap::new,
                        (map, entry) -> map.put(entry.getKey(), entry.getValue()),
                        LinkedHashMap::putAll
                );
    }

    private List<String> getConstructionsNamesFromConstructionSet(ConstructionSetDocument constructionSetDocument){
        return constructionSetDocument.getProperties()
                .values()
                .stream()
                .filter(Objects::nonNull)
                .filter(value -> !value.isBlank())
                .filter(value-> !value.equals(constructionSetDocument.getName()))
                .toList();
    }

    private void findConstructionSet(String name){
        this.constructionSetDocument = this.constructionSetRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Construction set not found"));
    }

    private void findConstructions(){
        List<String> constructionNames = this.getConstructionsNamesFromConstructionSet(this.constructionSetDocument);

        this.constructionsDocumentsList = this.findComponents(
                constructionNames,
                this.constructionRepository::findByNameIn
        );

        List<String> existingNames = extractComponentNames(this.constructionsDocumentsList);

        this.ValidateComponents(
                findMissingComponentNames (
                        constructionNames,
                        existingNames
                ),
                "constructions");
    }

    private void findMaterials() {
        List<String> materialNames = this.getMaterialNamesFromConstructions(this.constructionsDocumentsList);

        this.materialDocumentList = this.findComponents(
                materialNames,
                this.materialRepository::findByNameIn
        );



        List<String> existingNames = new ArrayList<>(extractComponentNames(this.materialDocumentList));

        this.ValidateComponents(
                findMissingComponentNames (
                        materialNames,
                        existingNames
                ),
                "materials");
    }

    // Find documents base on their n
    private <T extends BaseConstructionsDocument> List<T> findComponents(
            List<String> requiredNames,
            Function<List<String>, List<T>> finder
    ) {

        return finder.apply(requiredNames);
    }

    private void ValidateComponents(
            List<String> missingNames,
            String componentType
    ){

        if (!missingNames.isEmpty()) {
            throw new RuntimeException("Missing " + componentType + ": " + missingNames);
        }
    }

    // START: Check is required components exists
    private List<String> extractComponentNames(
            List<? extends BaseConstructionsDocument> componentDocuments
    ) {
        return componentDocuments.stream()
                .map(BaseConstructionsDocument::getName)
                .filter(Objects::nonNull)
                .filter(name -> !name.isBlank())
                .toList();
    }

    private List<String> findMissingComponentNames (
            List<String> requiredNames,
            List<String> existingNames
    ) {
        Set<String> existingNamesSet = new HashSet<>(
                existingNames
        );

        return requiredNames.stream()
                .filter(Objects::nonNull)
                .filter(name -> !name.isBlank())
                .filter(name -> !existingNamesSet.contains(name))
                .distinct()
                .toList();
    }
    // END: Check is required components exists
}
