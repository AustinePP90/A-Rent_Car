package com.apple.arentcar.controller;

import com.apple.arentcar.model.CarTypes;
import com.apple.arentcar.service.CarsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/arentcar")
public class CarsController {

    @Autowired
    private CarsService carsService;

    @GetMapping("/manager/cars")
    public List<CarTypes> getAllCars() { return carsService.getAllCars(); }

    @GetMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<CarTypes> getCarsById(@PathVariable Integer carTypeCode) {
        CarTypes carTypes = carsService.getCarsById(carTypeCode);
        if (carTypes != null) {
            return ResponseEntity.ok(carTypes);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 차종 조회 및 페이지네이션(검색 기능 포함)
    @GetMapping("/manager/cars/paged")
    public ResponseEntity<List<CarTypes>> getCarsWithPaging(
                                             @RequestParam int pageSize,
                                             @RequestParam int pageNumber,
                                             @RequestParam(required = false) String carTypeName) {
        List<CarTypes> carTypes;
        if (carTypeName != null && !carTypeName.isEmpty()) {
            carTypes = carsService.getCarsByNameWithPaging(carTypeName, pageSize, pageNumber);
        } else {
            carTypes = carsService.getCarsWithPaging(pageSize, pageNumber);
        }
        return ResponseEntity.ok(carTypes);
    }

    // 전체 차종 수 조회(검색 기능 포함)
    @GetMapping("/manager/cars/count")
    public ResponseEntity<Integer> getTotalCarsCount(@RequestParam(required = false) String carTypeName) {
        int count;
        if (carTypeName != null && !carTypeName.isEmpty()) {
            count = carsService.countCarsByName(carTypeName);
        } else {
            count = carsService.countAllCars();
        }
        return ResponseEntity.ok(count);
    }

    // 차종 등록
    @PostMapping("/manager/cars")
    public ResponseEntity<CarTypes> createCars(@RequestBody CarTypes carTypes) {
        CarTypes savedCars = carsService.createCars(carTypes);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCars);
    }

    // 차종 삭제
    @DeleteMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<Void> deleteCarsById(@PathVariable Integer carTypeCode) {
        carsService.deleteCarsById(carTypeCode);
        return ResponseEntity.noContent().build();
    }

    // 차종 수정
    @PutMapping("/manager/cars/{carTypeCode}")
    public ResponseEntity<Void> updateCarsById(@PathVariable Integer carTypeCode,
                                               @RequestBody CarTypes carTypes) {
        carTypes.setCarTypeCode(carTypeCode);
        carsService.updateCarsById(carTypes);
        return ResponseEntity.noContent().build();
    }
}
