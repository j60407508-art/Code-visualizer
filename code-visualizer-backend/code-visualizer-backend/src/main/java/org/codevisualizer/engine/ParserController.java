package org.codevisualizer.engine;

import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.ConstructorDeclaration;
import com.github.javaparser.ast.body.FieldDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;

@RestController
@RequestMapping("/api/parser")
@CrossOrigin(origins = "*")
public class ParserController {

    @PostMapping("/analyze")
    public Map<String, Object> analyzeCode(@RequestBody Map<String, String> request) {
        String code = request.get("code");

        if (code == null || code.isBlank()) {
            return Map.of("error", "Request body must include a non-empty 'code' field.");
        }

        List<Map<String, Object>> nodes = new ArrayList<>();
        List<Map<String, Object>> edges = new ArrayList<>();
        List<String> registeredClassNames = new ArrayList<>();

        try {
            CompilationUnit cu = StaticJavaParser.parse(code);

            // PASS 1: Find Classes and analyze Design Pattern Signatures
            cu.findAll(ClassOrInterfaceDeclaration.class).forEach(cid -> {
                String name = cid.getNameAsString();
                registeredClassNames.add(name);
                boolean isInterface = cid.isInterface();

                String type = "GenericClass";
                if (isInterface) {
                    type = "Interface";
                } else if (name.endsWith("Controller")) {
                    type = "Controller";
                } else if (name.endsWith("Service")) {
                    type = "Service";
                } else if (name.endsWith("Repository") || name.endsWith("Database")) {
                    type = "DatabaseLayer";
                }

                // --- PATTERN DETECTOR LOGIC ---
                boolean isSingleton = false;
                boolean isFactory = false;

                if (!isInterface) {
                    // Check Singleton: Private constructor + static field of same class type
                    AtomicBoolean hasPrivateConstructor = new AtomicBoolean(false);
                    AtomicBoolean hasStaticSelfField = new AtomicBoolean(false);

                    cid.findAll(ConstructorDeclaration.class).forEach(constructor -> {
                        if (constructor.isPrivate()) {
                            hasPrivateConstructor.set(true);
                        }
                    });

                    cid.findAll(FieldDeclaration.class).forEach(field -> {
                        if (field.isStatic() && field.getVariables().stream()
                                .anyMatch(v -> v.getType().asString().equals(name))) {
                            hasStaticSelfField.set(true);
                        }
                    });

                    if (hasPrivateConstructor.get() && hasStaticSelfField.get()) {
                        isSingleton = true;
                    }

                    // Check Factory Pattern: Name contains "Factory" OR has a method returning another type
                    if (name.toLowerCase().contains("factory")) {
                        isFactory = true;
                    } else {
                        // If any method creates or returns instances of other custom types in the ecosystem
                        for (MethodDeclaration method : cid.findAll(MethodDeclaration.class)) {
                            if (method.getNameAsString().startsWith("get") || method.getNameAsString().startsWith("create")) {
                                String returnType = method.getType().asString();
                                if (!returnType.equals("void") && !returnType.equals(name)) {
                                    isFactory = true;
                                    break;
                                }
                            }
                        }
                    }
                }

                // Build components data configuration
                Map<String, Object> nodeData = new HashMap<>();
                nodeData.put("name", name);
                nodeData.put("type", type);
                nodeData.put("isSingleton", isSingleton);
                nodeData.put("isFactory", isFactory);

                nodes.add(nodeData);
            });

            // PASS 2: Find Structural Links/Edges
            cu.findAll(ClassOrInterfaceDeclaration.class).forEach(cid -> {
                String currentClassName = cid.getNameAsString();

                cid.getExtendedTypes().forEach(ext -> {
                    if (registeredClassNames.contains(ext.getNameAsString())) {
                        edges.add(Map.of("source", currentClassName, "target", ext.getNameAsString(), "relationType", "inheritance"));
                    }
                });

                cid.getImplementedTypes().forEach(impl -> {
                    if (registeredClassNames.contains(impl.getNameAsString())) {
                        edges.add(Map.of("source", currentClassName, "target", impl.getNameAsString(), "relationType", "implementation"));
                    }
                });

                cid.findAll(FieldDeclaration.class).forEach(field -> {
                    field.getVariables().forEach(variable -> {
                        String fieldType = variable.getType().asString();
                        if (registeredClassNames.contains(fieldType) && !fieldType.equals(currentClassName)) {
                            edges.add(Map.of("source", currentClassName, "target", fieldType, "relationType", "dependency"));
                        }
                    });
                });
            });

        } catch (Exception e) {
            return Map.of("error", "Parsing error: " + e.getMessage());
        }

        return Map.of("nodes", nodes, "edges", edges);
    }
}