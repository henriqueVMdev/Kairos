public class Cliente {
    private int codigoCTI;
    private String segmento;
    private int nivel;
    private double faturamento;

    public Cliente(int codigoCTI, String segmento, int nivel, double faturamento){
        setCodigoCTI(codigoCTI);
        setSegmento(segmento);
        setNivel(nivel);
        setFaturamento(faturamento);
    }

    public int getCodigoCTI(){
        return codigoCTI;
    }
    public void setCodigoCTI(int codigoCTI){
        this.codigoCTI = codigoCTI;
    }

    public String getSegmento(){
        return segmento;
    }
    public void setSegmento(String segmento){
        this.segmento = segmento;
    }

    public int getNivel(){
        return nivel;
    }
    public void setNivel(int nivel){
        this.nivel = nivel;
    }

    public double getFaturamento(){
        return faturamento;
    }
    public void setFaturamento(double faturamento){
        this.faturamento = faturamento;
    }
}


