package com.cozybench.simulation;

import com.cozybench.config.SecurityConfig;
import com.cozybench.simulation.controller.SimulationController;
import com.cozybench.simulation.service.SimulationComparisonService;
import com.cozybench.simulation.service.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SimulationController.class)
@Import(SecurityConfig.class)
class SimulationExportHttpTests {
    @Autowired MockMvc mvc;
    @MockitoBean SimulationService simulations;
    @MockitoBean SimulationComparisonService comparisons;
    @MockitoBean JwtDecoder decoder;

    @Test
    void annualExportHasNoAsyncDeadlineAndReturnsAJsonAttachment() throws Exception {
        String json = "{\"simulation\":{\"status\":\"COMPLETED\"},\"timesteps\":[]}";
        when(simulations.exportJson("owner", "user@example.com", "run"))
                .thenReturn(output -> output.write(json.getBytes(StandardCharsets.UTF_8)));
        var result = mvc.perform(get("/api/v1/simulations/run/export")
                        .with(jwt().jwt(token -> token.subject("owner").claim("email", "user@example.com"))))
                .andExpect(request().asyncStarted())
                .andReturn();
        assertEquals(0L, result.getRequest().getAsyncContext().getTimeout());
        mvc.perform(asyncDispatch(result))
                .andExpect(status().isOk())
                .andExpect(content().contentType("application/json"))
                .andExpect(header().string("Content-Disposition", "attachment; filename=\"simulation-run.json\""))
                .andExpect(header().string("Cache-Control", "no-store"))
                .andExpect(content().json(json));
        verify(simulations).exportJson("owner", "user@example.com", "run");
    }

    @Test
    void exportStillRequiresAuthentication() throws Exception {
        mvc.perform(get("/api/v1/simulations/run/export"))
                .andExpect(status().isUnauthorized());
        verifyNoInteractions(simulations);
    }
}
