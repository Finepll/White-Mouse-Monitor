package com.example.monitorserver.email.controller;

import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.web.bind.annotation.*;
import java.util.Properties;
import java.util.Random;
import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin
public class EmailController {

    // 内存存储用户信息（key=用户名，value=密码）
    private final Map<String, String> userDB = new HashMap<>();
    // 存储验证码（key=邮箱，value=验证码）
    private final Map<String, String> codeDB = new HashMap<>();

    // 1. 发送邮箱验证码（校园网587端口稳定版）
    @PostMapping("/sendCode")
    public String sendCode(@RequestParam String email) {
        // 生成6位验证码
        String code = String.valueOf(100000 + new Random().nextInt(900000));
        codeDB.put(email, code);

        // 配置QQ邮箱发送（587端口，校园网兼容）
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost("smtp.qq.com");
        sender.setPort(587);
        sender.setUsername("3999294360@qq.com");
        sender.setPassword("tgsfwuyesyfvcgab"); // 替换为你的最新授权码

        Properties prop = new Properties();
        prop.put("mail.smtp.auth", "true");
        prop.put("mail.smtp.starttls.enable", "true");
        prop.put("mail.smtp.ssl.enable", "false");
        prop.put("mail.smtp.connectiontimeout", "10000");
        sender.setJavaMailProperties(prop);

        // 发送邮件
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("3999294360@qq.com");
            msg.setTo(email);
            msg.setSubject("小白鼠监测系统注册验证码");
            msg.setText("您的注册验证码是：" + code + "，5分钟内有效");
            sender.send(msg);
            return "验证码发送成功，请查收邮箱";
        } catch (Exception e) {
            e.printStackTrace();
            return "发送失败：" + e.getMessage();
        }
    }

    // 2. 用户注册接口
    @PostMapping("/register")
    public String register(
            @RequestParam String username,
            @RequestParam String email,
            @RequestParam String code,
            @RequestParam String password) {
        // 校验验证码
        String validCode = codeDB.get(email);
        if (validCode == null || !validCode.equals(code)) {
            return "验证码错误或已过期";
        }
        // 校验用户名是否已存在
        if (userDB.containsKey(username)) {
            return "用户名已被注册";
        }
        // 存储用户信息（明文测试，正式环境用BCrypt加密）
        userDB.put(username, password);
        return "注册成功";
    }

    // 3. 用户登录接口（核心！之前没有这个接口！）
    @PostMapping("/login")
    public String login(
            @RequestParam String username,
            @RequestParam String password) {
        // 校验用户名是否存在
        if (!userDB.containsKey(username)) {
            return "用户名不存在";
        }
        // 校验密码是否正确
        String storedPwd = userDB.get(username);
        if (!storedPwd.equals(password)) {
            return "密码错误";
        }
        // 登录成功
        return "登录成功";
    }

    // 4. 验证码校验接口（注册时二次校验用）
    @PostMapping("/checkCode")
    public String checkCode(@RequestParam String email, @RequestParam String code) {
        String validCode = codeDB.get(email);
        if (validCode != null && validCode.equals(code)) {
            return "验证成功";
        } else {
            return "验证码错误";
        }
    }
}