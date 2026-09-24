package org.codevisualizer.engine;

import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ParserControllerTest {

    private final ParserController controller = new ParserController();

    @Test
    void analyzeCode_singleClass_returnsOneNode() {
        String code = "public class OrderService {}";

        Map<String, Object> result = controller.analyzeCode(Map.of("code", code));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> nodes = (List<Map<String, Object>>) result.get("nodes");

        assertEquals(1, nodes.size());
        assertEquals("OrderService", nodes.get(0).get("name"));
    }

    @Test
    void analyzeCode_blankCode_returnsError() {
        Map<String, Object> result = controller.analyzeCode(Map.of("code", ""));

        assertTrue(result.containsKey("error"));
    }
}