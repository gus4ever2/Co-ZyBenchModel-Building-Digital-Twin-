package com.example.cozybench.service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class PlantService {
    private final RestTemplate restTemplate;
    private MultiValueMap<String, Object> body;
    private static HttpHeaders headers = new HttpHeaders();
    static{
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    }


    public String createPlant(
            String userEmail,
            String plantName,
            MultipartFile plant,
            MultipartFile spathiphyllum
    ) {
        String url = SimulationService.getPYTHON_SERVER_URL() + "/createPlant";

        this.body = new LinkedMultiValueMap<>();

        this.body.add("userEmail", userEmail);
        this.body.add("plantName", plantName);

        this.addFileToBody(plant, "plant");
        this.addFileToBody(spathiphyllum, "spathiphyllum");

        HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<FileSaved> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                FileSaved.class
        );

        if (response.getStatusCode() == HttpStatus.CREATED) {
            FileSaved filesSaved = response.getBody();

            assert filesSaved != null;
            return filesSaved.id();
        } else {
            throw new RuntimeException("Failed to save to plant files");
        }
    }

    private void addFileToBody(MultipartFile file, String fileName) {
        if (file != null) {
            try {
                this.body.add(fileName, new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                    @Override
                    public String getFilename() {
                        return fileName;
                    }
                });
            } catch (IOException e) {
                throw new RuntimeException("Failed to process the uploaded files", e);
            }
        }
    }
}


