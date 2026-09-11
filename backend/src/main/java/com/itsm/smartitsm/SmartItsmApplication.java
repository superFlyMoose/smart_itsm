package com.itsm.smartitsm;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Smart ITSM 智能 IT 服务管理系统启动类
 */
@SpringBootApplication
@MapperScan("com.itsm.smartitsm.module.**.mapper")
public class SmartItsmApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartItsmApplication.class, args);
    }
}
