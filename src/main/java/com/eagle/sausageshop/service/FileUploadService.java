package com.eagle.sausageshop.service;

import jakarta.servlet.ServletContext;
import jakarta.ws.rs.WebApplicationException;
import com.eagle.sausageshop.util.Env;
import org.apache.commons.io.FilenameUtils;
import org.glassfish.jersey.media.multipart.ContentDisposition;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class FileUploadService {
    private static final String UPLOAD_DIRECTORY_NAME = "/uploads";
    private final ServletContext context;

    public FileUploadService(ServletContext context) {
        this.context = context;
    }

    public FileItem uploadFile(String directoryName, InputStream inputStream, ContentDisposition fileMetaData) {
        return writeFile(UPLOAD_DIRECTORY_NAME + "/" + directoryName, inputStream, fileMetaData);
    }

    private FileItem writeFile(String pathName, InputStream inputStream, ContentDisposition contentDisposition) {
        Path uploadPath = Paths.get(context.getRealPath(pathName));
        String extension = FilenameUtils.getExtension(contentDisposition.getFileName());
        String fileName = System.currentTimeMillis() + "." + extension;

        if (!Files.exists(uploadPath)) {
            try {
                System.out.println("Upload path not found. Creating Directory: \"" + uploadPath + "\"");
                Files.createDirectories(uploadPath);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }

        Path filePath = uploadPath.resolve(fileName);
        try (OutputStream outputStream = Files.newOutputStream(filePath)) {
            int read;
            byte[] bytes = new byte[1024];
            while ((read = inputStream.read(bytes)) != -1) {
                outputStream.write(bytes, 0, read);
            }
            outputStream.flush();
        } catch (IOException e) {
            throw new WebApplicationException("Error while file uploading! Try Again...");
        }

        String appUrl = Env.get("app.url");
        String contextPath = context.getContextPath();
        /*
         * http://localhost:8080/sausageShop/uploads/product/1/123456.png
         * */
        String relativePath = pathName + "/" + fileName;
        String url = contextPath + relativePath;
        String path = filePath.toString();
        String fullUrl = appUrl + relativePath;

        return new FileItem(fileName, contentDisposition.getFileName(), path, url, fullUrl);
    }

    public static class FileItem {
        private String fileName;
        private String originalFileName;
        private String filePath;
        private String url;
        private String fullUrl;

        public FileItem(String fileName, String originalFileName, String filePath, String url, String fullUrl) {
            this.fileName = fileName;
            this.originalFileName = originalFileName;
            this.filePath = filePath;
            this.url = url;
            this.fullUrl = fullUrl;
        }

        public void setFileName(String fileName) {
            this.fileName = fileName;
        }

        public void setOriginalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
        }

        public void setFilePath(String filePath) {
            this.filePath = filePath;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public void setFullUrl(String fullUrl) {
            this.fullUrl = fullUrl;
        }

        public String getFileName() {
            return fileName;
        }

        public String getOriginalFileName() {
            return originalFileName;
        }

        public String getFilePath() {
            return filePath;
        }

        public String getUrl() {
            return url;
        }

        public String getFullUrl() {
            return fullUrl;
        }
    }
}
