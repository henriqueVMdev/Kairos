public class Insights {
    private String tipo;
    private String descricao;
    private  int geradoEm;


    public Insights(String tipo, String descricao, int geradoEm){
        setTipo(tipo);
        setDescricao(descricao);
        setGeradoEm(geradoEm);
    }
    
    public String getTipo(){
        return tipo;
    }
    public void setTipo(String tipo){
        this.tipo = tipo;
    }

    public String getDescricao(){
        return descricao;
    }
    public void setDescricao(String descricao){
        this.descricao = descricao;
    }
    public int getGeradoEm(){
        return geradoEm;
    }
    public void setGeradoEm(int geradoEm){
        this.geradoEm = geradoEm;
    }
}

