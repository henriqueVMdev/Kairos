

public class Telemetria {
    private String eventos;
    private String status;
    private int timestamp;

    public Telemetria(String eventos, String status, int timestamp){
        setEventos(eventos);
        setStatus(status);
        setTimestamp(timestamp);
    }

    public String getEventos() {
        return eventos;
    }

    public void setEventos(String eventos) {
        this.eventos = eventos;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(int timestamp) {
        this.timestamp = timestamp;
    }    
}
